// @flow
import { signinLogic, signoutLogic } from '../ducks/auth'
import {
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
} from '../ducks/todoPubSub'

const rootLogic = [
  signinLogic,
  signoutLogic,
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
]

export default rootLogic
