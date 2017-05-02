// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { replace, syncHistoryWithStore } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloProvider } from 'react-apollo'
import WebClient from './WebClient'
import App from './containers/App'
import HomeApp from './containers/Home/HomeApp'
import SigninApp from './containers/Signin/SigninApp'
import TodoApp from './containers/Todo/TodoApp'
import RemoteTodoApp from './containers/RemoteTodo/RemoteTodoApp'
import PubSubTodoApp from './containers/PubSubTodo/PubSubTodoApp'
import NotFound from './components/NotFound'
import configureStore from './redux/store'
import createApolloClient from './apollo/create-apollo-client'
import getNetworkInterface from './apollo/transport'
import { signinResume } from './ducks/auth'
import config from '../config.json'

import './index.css'

const wsClient = new SubscriptionClient(config.wsURL, {
  reconnect: true,
  connectionParams: {}
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  getNetworkInterface(config.graphqlURL, {}),
  wsClient
)

const apolloClient = createApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  initialState: window.__APOLLO_STATE__,
  ssrForceFetchDelay: 100
})

const webClient = new WebClient()

const store = configureStore({}, apolloClient, webClient)
const history = syncHistoryWithStore(browserHistory, store)

const userAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth,
  predicate: auth => !!auth.username,
  redirectAction: replace,
  allowRedirectBack: true,
  failureRedirectPath: '/signin',
  wrapperDisplayName: 'userAuthenticated'
})

const userNotAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth,
  predicate: auth => !auth.username,
  redirectAction: replace,
  allowRedirectBack: false,
  failureRedirectPath: (state, ownProps) =>
    ownProps.location.query.redirect || localStorage.getItem('redirectPath') || '/',
  wrapperDisplayName: 'userNotAuthenticated'
})

const accessToken = localStorage.getItem('accessToken')
if (accessToken) {
  store.dispatch(signinResume())
}

ReactDOM.render(
  <ApolloProvider store={store} client={apolloClient}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeApp} />
        <Route path="signin" component={userNotAuthenticated(SigninApp)} />
        <Route path="todo" component={userAuthenticated(TodoApp)} />
        <Route path="todo-remote" component={userAuthenticated(RemoteTodoApp)} />
        <Route path="todo-pubsub" component={userAuthenticated(PubSubTodoApp)} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)
