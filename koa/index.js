// @flow
import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import convert from 'koa-convert'
import R from 'ramda'
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { executableSchema } from './executableSchema'
import subscriptionManager from './subscriptions'
import { resolvers } from './resolvers'
import queryMap from '../extracted_queries.json'
import errorHandler from './error'
import env from './env'
import { jwtUser, signin, signout, tokenRefresh } from './auth'

const app = new Koa()

app.proxy = true

// Logger, parser and error handler

app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

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

router.post('/auth/signin', signin)
router.post('/auth/signout', signout)
router.post('/auth/tokenRefresh', tokenRefresh)

router.post('/graphql', jwtUser, async (ctx, next) => {
  await convert(graphqlKoa({ schema: executableSchema, context: { ctx } }))(ctx, next)
})

// router.post(
//   '/graphql',
//   jwtUser,
//   graphqlKoa(ctx => ({
//     schema: executableSchema,
//     context: { ctx }
//   }))
// )

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
