import {
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
} from '../ducks/todoPubSub'

const rootLogic = [
  todoSubscribeLogic,
  todoUnsubscribeLogic,
  todoCreateLogic,
  todoToggleLogic
]

export default rootLogic
