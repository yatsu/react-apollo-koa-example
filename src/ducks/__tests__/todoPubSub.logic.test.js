import { createMockStore } from 'redux-logic-test'
import Rx from 'rxjs'
import TODO_UPDATED_SUBSCRIPTION from '../../graphql/todoUpdatedSubscription.graphql'

import {
  SUBSCRIBE,
  SUBSCRIBE_SUCCEEDED,
  RECEIVE_SUCCEEDED,
  initialState,
  todoSubscribeLogic
} from '../todoPubSub'

describe('todoSubscribeLogic', () => {
  it('dispatches SUBSCRIBE_SUCCEEDED on success', () => {
    const scheduler = new Rx.TestScheduler((a, b) => expect(a).toEqual(b))
    scheduler.maxFrames = 1000
    const subscriptions = { todo: null }
    const todo$ = Rx.Observable
      .of({ todoUpdated: { id: '1', text: 'foo', completed: true } })
      .delay(100, scheduler)
    let todoSub = null
    todo$.subscribe_ = todo$.subscribe
    todo$.subscribe = (observer) => {
      const sub = todo$.subscribe_(observer)
      sub._networkSubscriptionId = 1
      todoSub = sub
      return sub
    }
    let subscribeQuery = null
    const store = createMockStore({
      initialState,
      injectedDeps: {
        apollo: {
          subscribe: (query) => {
            subscribeQuery = query
            return todo$
          }
        },
        subscriptions
      },
      logic: [todoSubscribeLogic]
    })
    store.dispatch({ type: SUBSCRIBE })
    scheduler.flush()
    expect(store.actions).toEqual([
      {
        type: SUBSCRIBE
      },
      {
        type: SUBSCRIBE_SUCCEEDED,
        payload: {
          subid: 1
        }
      },
      {
        type: RECEIVE_SUCCEEDED,
        payload: {
          todo: { id: '1', text: 'foo', completed: true }
        }
      }
    ])
    expect(subscriptions.todo).toBe(todoSub)
    expect(subscribeQuery).toEqual({
      query: TODO_UPDATED_SUBSCRIPTION
    })
  })
})
