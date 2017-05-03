// @flow
import { signinLogic, signoutLogic, autoSignoutLogic } from '../ducks/auth'
import {
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
} from '../ducks/todoPubSub'

const rootLogic = [
  signinLogic,
  signoutLogic,
  autoSignoutLogic,
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
]

export default rootLogic
