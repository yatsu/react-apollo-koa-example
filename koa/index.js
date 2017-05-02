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
import env from './env'
import {
  localSignin,
  googleSignin,
  facebookSignin,
  twitterSignin,
  signinCallback,
  signinFailed,
  signout
} from './auth'

const app = new Koa()

app.proxy = true

// Sessions

app.keys = [env('SESSION_SECRET')]
app.use(convert(session()))

// Logger, parser and error handler

app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

// Authentication

app.use(passport.initialize())
app.use(passport.session())

// GraphQL persisted query

app.use(async (ctx: Object, next: () => {}) => {
  if (ctx.path === '/graphql' && ctx.request.body.id) {
    const invertedMap = R.invertObj(queryMap)
    ctx.request.body.query = invertedMap[ctx.request.body.id]
  }
  await next()
})

// Routes

const router = Router()

async function authenticated(ctx: Object, next: () => {}) {
  if (ctx.isAuthenticated()) {
    await next()
    return
  }
  ctx.body = {
    error: {
      message: 'Access denied.'
    }
  }
  ctx.status = 401
}

router.post('/auth/signin', localSignin)
router.get('/auth/google/signin', googleSignin)
router.get('/auth/facebook/signin', facebookSignin)
router.get('/auth/twitter/signin', twitterSignin)
router.get('/auth/social/signin/callback', signinCallback)
router.put('/auth/social/singin/failed', signinFailed)
router.post('/auth/signout', signout)

router.post('/graphql', authenticated, async (ctx, next) => {
  await convert(graphqlKoa({ schema: executableSchema }))(ctx, next)
})

if (process.env !== 'production') {
  router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))
}

app.use(router.routes())
app.use(router.allowedMethods())

// Launching server

const server = app.listen(env('SERVER_PORT'), env('SERVER_HOST'))

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
