// @flow
import { signinLogic, signoutLogic, autoSignoutLogic } from '../ducks/auth'
import { todosFetchLogic, todoCreateLogic, todoToggleLogic } from '../ducks/todoRemote'
import {
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic as todoCreateLogicForPubSub,
  todoToggleLogic as todoToggleLogicForPubSub
} from '../ducks/todoPubSub'

const rootLogic = [
  signinLogic,
  signoutLogic,
  autoSignoutLogic,
  todosFetchLogic,
  todoCreateLogic,
  todoToggleLogic,
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogicForPubSub,
  todoToggleLogicForPubSub
]

export default rootLogic
