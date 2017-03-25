// @flow
import { createStore, applyMiddleware, compose } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { createLogicMiddleware } from 'redux-logic'
import configureRootReducer from './reducer'
import rootLogic from './logic'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(
  initialState: Object,
  apolloClient: Object,
  webClient: Object
) {
  const rootReducer = configureRootReducer(apolloClient)

  const logicMiddleware = createLogicMiddleware(rootLogic, {
    apolloClient,
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
