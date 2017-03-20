// @flow
import React from 'react'
import { Divider } from 'semantic-ui-react'
import AddTodo from './AddTodo'
import VisibleTodoList from './VisibleTodoList'

const TodoApp = () => (
  <div className="ui main text container main-content">
    <h1>Todo Example</h1>
    <AddTodo />
    <Divider />
    <VisibleTodoList />
  </div>
)

export default TodoApp
