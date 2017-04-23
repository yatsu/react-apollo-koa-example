// @flow
import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import convert from 'koa-convert'
import session from 'koa-generic-session'
import passport from 'koa-passport'
import R from 'ramda'
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { executableSchema } from './executableSchema'
import subscriptionManager from './subscriptions'
import { resolvers } from './resolvers'
import queryMap from '../extracted_queries.json'
import errorHandler from './error'

require('dotenv').config()

const app = new Koa()

app.proxy = true

// Sessions
app.keys = [process.env.SESSION_SECRET]
app.use(convert(session()))

// Logger, Parser & Error Handler
app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

// Authentication
require('./auth')

app.use(passport.initialize())
app.use(passport.session())

app.use(async (ctx: Object, next: () => {}) => {
  if (ctx.path === '/graphql' && ctx.request.body.id) {
    const invertedMap = R.invertObj(queryMap)
    ctx.request.body.query = invertedMap[ctx.request.body.id]
  }
  await next()
})

const router = Router()

router.post('/graphql', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    graphqlKoa({ schema: executableSchema })(ctx, next)
  } else {
    ctx.body = {
      error: {
        message: 'Access Denied.'
      }
    }
    ctx.status = 401
  }
})

router.get('/graphql', graphqlKoa({ schema: executableSchema }))
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

router.post('/auth/signin', async (ctx, next) => {
  await passport.authenticate('local', async (err, user, info) => {
    if (user === false) {
      ctx.body = {
        error: {
          type: 'Local',
          message: 'User Name or Password Incorrect.',
          status: 401
        }
      }
      ctx.status = 401
    } else {
      await ctx.login(user, info)
      ctx.body = info
      ctx.status = 201
    }
  })(ctx, next)
})

router.get('/auth/google/signin', async (ctx, next) => {
  ctx.session.authenticatingService = 'google'
  await passport.authenticate('google')(ctx, next)
})

router.get('/auth/facebook/signin', async (ctx, next) => {
  ctx.session.authenticatingService = 'facebook'
  await passport.authenticate('facebook')(ctx, next)
})

router.get('/auth/twitter/signin', async (ctx, next) => {
  ctx.session.authenticatingService = 'twitter'
  await passport.authenticate('twitter')(ctx, next)
})

router.get('/auth/social/signin/callback', async (ctx, next) => {
  const error = {
    type: 'Social',
    message: '',
    status: 401
  }
  const service = ctx.session.authenticatingService
  if (!service) {
    error.message = 'An attempt was made to continue a social service login without the initial sequence.'
    ctx.body = { error }
    ctx.status = 401
  }
  await passport.authenticate(service, async (err, user, info) => {
    if (user === false || err !== null) {
      error.message = `Social Login Callback Error: ${err}`
      ctx.body = { error }
      ctx.status = 401
    } else {
      await ctx.login(user, info)
      ctx.body = info
      ctx.status = 201
    }
  })(ctx, next)
})

router.put('/auth/social/singin/failed', async (ctx) => {
  delete ctx.session.authenticatingService
  ctx.status = 201
})

router.post('/auth/signout', (ctx) => {
  ctx.logout()
  ctx.body = {}
  ctx.status = 201
})

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST)

// eslint-disable-next-line no-new
new SubscriptionServer(
  {
    subscriptionManager,
    onSubscribe(message, params) {
      setTimeout(
        () => {
          resolvers.TodoList.todos().forEach((todo) => {
            subscriptionManager.pubsub.publish('todoUpdated', todo)
          })
        },
        0
      )
      return Promise.resolve(params)
    }
  },
  {
    server,
    path: '/graphql-sock'
  }
)
