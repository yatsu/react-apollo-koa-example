// @flow
import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import R from 'ramda'
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { executableSchema } from './executableSchema'
import subscriptionManager from './subscriptions'
import { resolvers } from './resolvers'
import queryMap from '../extracted_queries.json'
import errorHandler from './error'
import { signin, signout } from './auth'

require('dotenv').config()

const app = new Koa()

app.proxy = true

app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

app.use(async (ctx: Object, next: () => {}) => {
  if (ctx.path === '/graphql' && ctx.request.body.id) {
    const invertedMap = R.invertObj(queryMap)
    ctx.request.body.query = invertedMap[ctx.request.body.id]
  }
  await next()
})

const router = Router()

router.post('/graphql', graphqlKoa({ schema: executableSchema }))
router.get('/graphql', graphqlKoa({ schema: executableSchema }))
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))
router.post('/api/signin', signin)
router.post('/api/signout', signout)

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
