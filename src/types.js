export type Action = {
  type: string,
  payload?: Object
}

export type ErrorType = {
  message: string,
  status?: number
}

export type Todo = {
  id: string,
  text: string,
  completed: boolean
}

export type TodoList = {
  todos: Array<Todo>
}
