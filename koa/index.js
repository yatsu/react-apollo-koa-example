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
import queryMap from '../src/extracted_queries.json'
import errorHandler from './error'
import env from './env'
import { todos } from './store'
import { signin, signout, tokenRefresh, githubAuthRedirect, githubAuthCB } from './auth'
import type { Todo } from '../src/types'

const app = new Koa()

app.proxy = true

// Logger, parser and error handler

app.use(logger())
app.use(bodyParser())
app.use(errorHandler)

// GraphQL persisted query

app.use(async (ctx: Object, next: () => void) => {
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
router.post('/auth/refresh', tokenRefresh)

router.post('/auth/github', githubAuthRedirect)
router.post('/auth/github/:redirect', githubAuthRedirect)
router.post('/auth/cb/github', githubAuthCB)

router.post(
  '/graphql',
  graphqlKoa(ctx => ({
    schema: executableSchema,
    context: { ctx }
  }))
)

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
    onSubscribe(message: string, params: Object) {
      setTimeout(() => {
        R.forEach((todo: Todo) => {
          subscriptionManager.pubsub.publish('todoUpdated', todo)
        }, todos)
      }, 0)
      return Promise.resolve(params)
    }
  },
  {
    server,
    path: '/graphql-sock'
  }
)
