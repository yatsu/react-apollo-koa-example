import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { createServer } from 'http'
import createDebug from 'debug'
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

const debug = createDebug('example:server')

const app = new Koa()

app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

app.use(async (ctx, next) => {
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

app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST)

const websocketServer = createServer((request, response) => {
  response.writeHead(404)
  response.end()
})

websocketServer.listen(
  process.env.WS_PORT,
  () => debug(`WebSocket is running on port ${process.env.WS_PORT}`)
)

// eslint-disable-next-line no-new
new SubscriptionServer(
  {
    subscriptionManager,
    onSubscribe(message, params) {
      setTimeout(() => {
        resolvers.TodoList.todos().forEach((todo) => {
          subscriptionManager.pubsub.publish('todoUpdated', todo)
        })
      }, 0)
      return Promise.resolve(params)
    }
  },
  {
    server: websocketServer,
    path: '/graphql-sock'
  }
)
