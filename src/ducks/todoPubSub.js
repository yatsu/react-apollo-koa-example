// @flow
import R from 'ramda'
import { createAction, createReducer } from 'redux-act'
import { createLogic } from 'redux-logic'
import TODO_UPDATED_SUBSCRIPTION from '../graphql/todoUpdatedSubscription.graphql'
import ADD_TODO_MUTATION from '../graphql/addTodoMutation.graphql'
import TOGGLE_TODO_MUTATION from '../graphql/toggleTodoMutation.graphql'
import { errorObject } from '../utils'
import type { ErrorType, Todo } from '../types'

// Actions

export const todoPubSubSubscribe = createAction('TODO_PUBSUB_SUBSCRIBE')
export const todoPubSubSubscribeSucceeded = createAction('TODO_PUBSUB_SUBSCRIBE_SUCCEEDED')
export const todoPubSubUnsubscribe = createAction('TODO_PUBSUB_UNSUBSCRIBE')
export const todoPubSubReceiveSucceeded = createAction('TODO_PUBSUB_RECEIVE_SUCCEEDED')
export const todoPubSubReceiveFailed = createAction('TODO_PUBSUB_RECEIVE_FAILED')
export const todoPubSubCreate = createAction('TODO_PUBSUB_CREATE')
export const todoPubSubCreateSucceeded = createAction('TODO_PUBSUB_CREATE_SUCCEEDED')
export const todoPubSubCreateFailed = createAction('TODO_PUBSUB_CREATE_FAILED')
export const todoPubSubToggle = createAction('TODO_PUBSUB_TOGGLE')
export const todoPubSubToggleSucceeded = createAction('TODO_PUBSUB_TOGGLE_SUCCEEDED')
export const todoPubSubToggleFailed = createAction('TODO_PUBSUB_TOGGLE_FAILED')

// Types

type TodoPubSubState = {
  subid: ?string,
  todos: { [string]: Todo },
  createError: ?string,
  toggleError: ?string,
  receiveError: ?string
}

// Reducer

export const initialState: TodoPubSubState = {
  subid: null,
  todos: {},
  createError: null,
  toggleError: null,
  receiveError: null
}

export const todoPubSubReducer = createReducer(
  {
    [todoPubSubSubscribe]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubSubscribeSucceeded]: (
      state: TodoPubSubState,
      payload: { subid: string }
    ): TodoPubSubState =>
      R.merge(state, {
        subid: payload.subid
      }),

    [todoPubSubUnsubscribe]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubReceiveSucceeded]: (state: TodoPubSubState, payload: Todo): TodoPubSubState =>
      R.merge(state, {
        todos: R.assoc(payload.id, payload, state.todos)
      }),

    [todoPubSubReceiveFailed]: (state: TodoPubSubState, payload: ErrorType): TodoPubSubState =>
      R.merge(state, {
        receiveError: errorObject(payload)
      }),

    [todoPubSubCreate]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubCreateSucceeded]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubCreateFailed]: (state: TodoPubSubState, payload: ErrorType): TodoPubSubState =>
      R.merge(state, {
        createError: errorObject(payload)
      }),

    [todoPubSubToggle]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubToggleSucceeded]: (state: TodoPubSubState): TodoPubSubState => state,

    [todoPubSubToggleFailed]: (state: TodoPubSubState, payload: ErrorType): TodoPubSubState =>
      R.merge(state, {
        toggleError: errorObject(payload)
      })
  },
  initialState
)

// Logic

export const todoSubscribeLogic = createLogic({
  type: todoPubSubSubscribe,
  cancelType: todoPubSubUnsubscribe,
  warnTimeout: 0,

  // eslint-disable-next-line no-unused-vars
  process({ apollo, subscriptions, cancelled$ }, dispatch: Dispatch, done: () => void) {
    if (subscriptions.todo) {
      dispatch(todoPubSubSubscribeSucceeded({ subid: subscriptions.todo._networkSubscriptionId }))
      return
    }
    const sub = apollo.subscribe({ query: TODO_UPDATED_SUBSCRIPTION }).subscribe({
      next(payload: { todoUpdated: Todo }) {
        dispatch(todoPubSubReceiveSucceeded(payload.todoUpdated))
      },
      error(error: ErrorType) {
        dispatch(todoPubSubReceiveFailed(error))
      }
    })

    cancelled$.subscribe(() => {
      sub.unsubscribe()
      subscriptions.todo = null
    })

    subscriptions.todo = sub
    dispatch(todoPubSubSubscribeSucceeded({ subid: sub._networkSubscriptionId }))
  }
})

export const todoCreateLogic = createLogic({
  type: todoPubSubCreate,

  processOptions: {
    dispatchReturn: true,
    successType: todoPubSubCreateSucceeded,
    failType: todoPubSubCreateFailed
  },

  process({ apollo, action }) {
    return apollo
      .mutate({
        mutation: ADD_TODO_MUTATION,
        variables: { text: action.payload.text }
      })
      .map(resp => resp.data.addTodo)
  }
})

export const todoToggleLogic = createLogic({
  type: todoPubSubToggle,

  processOptions: {
    dispatchReturn: true,
    successType: todoPubSubToggleSucceeded,
    failType: todoPubSubToggleFailed
  },

  process({ apollo, action }) {
    return apollo
      .mutate({
        mutation: TOGGLE_TODO_MUTATION,
        variables: { id: action.payload.todoID }
      })
      .map(resp => resp.data.toggleTodo)
  }
})
