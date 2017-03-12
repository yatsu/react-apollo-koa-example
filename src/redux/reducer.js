import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { authReducer } from '../ducks/auth'
import todoReducer from '../ducks/todo'
import todoPubSubReducer from '../ducks/todoPubSub'

export default function configureRootReducer(client) {
  return combineReducers({
    apollo: client.reducer(),
    routing: routerReducer,
    auth: authReducer,
    todo: todoReducer,
    todoPubSub: todoPubSubReducer
  })
}
