import Koa from 'koa'
import convert from 'koa-convert'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { createServer } from 'http'
import R from 'ramda'
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa'
import { executableSchema } from './executableSchema'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import subscriptionManager from './subscriptions'
import { resolvers } from './resolvers'
import queryMap from '../extracted_queries.json'

require('dotenv').config()

const app = new Koa()

app.use(convert(logger()))
app.use(bodyParser())

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

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST)

const websocketServer = createServer((request, response) => {
  response.writeHead(404)
  response.end()
})
// console.log('websocketServer', websocketServer)

websocketServer.listen(
  process.env.WS_PORT,
  () => console.log(`WebSocket is running on port ${process.env.WS_PORT}`)
)

new SubscriptionServer(
  {
    subscriptionManager,
    onSubscribe(message, params, webSocket) {
      setTimeout(() => {
        resolvers.TodoList.todos().forEach(todo => {
          subscriptionManager.pubsub.publish('todoUpdated', todo)
        })
      }, 0)
      // return Promise.resolve(Object.assign({}, params, {}))
      return Promise.resolve(params)
    }
  },
  {
    server: websocketServer,
    path: '/graphql-sock'
  }
)
