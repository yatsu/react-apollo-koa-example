// eslint-disable-next-line no-undef
export type Action = {
  type: string,
  payload?: Object
}

// eslint-disable-next-line no-undef
export type ErrorType = {
  message: string,
  status?: number
}

// eslint-disable-next-line no-undef
export type Todo = {
  id: string,
  text: string,
  completed: boolean
}

// eslint-disable-next-line no-undef
export type TodoList = {
  todos: Array<Todo>
}

// eslint-disable-next-line no-undef
export type User = {
  username: string,
  password: ?string,
  admin: boolean,
  authService: ?string
}
