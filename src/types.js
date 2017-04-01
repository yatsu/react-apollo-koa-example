export type Todo = {
  id: string,
  text: string,
  completed: boolean
}

export type TodoList = {
  todos: Array<Todo>
}

export type ErrorType = {
  message: string,
  status?: number
}
