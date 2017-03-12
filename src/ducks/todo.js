import { Map as iMap, fromJS } from 'immutable'

// Actions

const CREATE = 'todo/CREATE'
const TOGGLE = 'todo/TOGGLE'

// Reducer

export default function todoReducer(state = iMap(), action = {}) {
  const todos = state.get('todos')
  switch (action.type) {
    case CREATE:
      return state.set('todos', todos.push(fromJS({
        id: todos.size.toString(),
        text: action.todo,
        completed: false
      })))
    case TOGGLE:
      return (() => {
        const todo = todos.get(action.todoId)
        return state.set(
          'todos',
          todos.set(
            action.todoId,
            todo.set('completed', !todo.get('completed'))
          )
        )
      })()
    default:
      return state
  }
}

// Action Creators

export function createTodo(todo) {
  return { type: CREATE, todo }
}

export function toggleTodo(todoId) {
  return { type: TOGGLE, todoId }
}
