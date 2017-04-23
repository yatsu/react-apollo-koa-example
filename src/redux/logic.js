// @flow
import {
  localSigninLogic,
  socialSigninCallbackLogic,
  signoutLogic,
  setRedirectPathLogic
} from '../ducks/auth'
import {
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
} from '../ducks/todoPubSub'

const rootLogic = [
  localSigninLogic,
  socialSigninCallbackLogic,
  signoutLogic,
  setRedirectPathLogic,
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
]

export default rootLogic
