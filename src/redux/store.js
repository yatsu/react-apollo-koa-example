// @flow
import createDebug from 'debug'
import R from 'ramda'
import Rx from 'rxjs'
import { createStore, applyMiddleware, compose } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { createLogicMiddleware } from 'redux-logic'
import configureRootReducer from './reducer'
import rootLogic from './logic'

const debugGraphQL = createDebug('example:graphql')

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(
  initialState: Object,
  apolloClient: Object,
  webClient: Object
) {
  const rootReducer = configureRootReducer(apolloClient)

  const logicMiddleware = createLogicMiddleware(rootLogic, {
    apolloClient,
    apollo: {
      // eslint-disable-next-line consistent-return
      mutate(options: Object) {
        return Rx.Observable.create((observer: Rx.Observer) => {
          Rx.Observable.fromPromise(apolloClient.mutate(options)).subscribe(
            (resp: Object) => {
              debugGraphQL('mutate response', resp)
              observer.next(resp)
              observer.complete()
            },
            (error: Object) => {
              debugGraphQL('mutate error', error)
              if (R.path(['graphQLErrors', 0, 'message'], error) === 'Access denied.') {
                webClient.tokenRefresh().subscribe(
                  () => {
                    Rx.Observable.fromPromise(apolloClient.mutate(options)).subscribe(
                      (retryResp: Object) => {
                        debugGraphQL('mutate retry response', retryResp)
                        observer.next(retryResp)
                        observer.complete()
                      },
                      (retryError: Object) => {
                        debugGraphQL('mutate retry error', retryError)
                        observer.error(retryError)
                      }
                    )
                  },
                  (refreshError: Object) => {
                    debugGraphQL('token refresh failed', refreshError)
                    observer.error(error)
                  }
                )
              } else {
                observer.error(error)
              }
            }
          )
        })
      }
    },
    webClient,
    subscriptions: { todo: null }
  })

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(routerMiddleware(browserHistory)),
      applyMiddleware(apolloClient.middleware()),
      applyMiddleware(logicMiddleware)
    )
  )
}
