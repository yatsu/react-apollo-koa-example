// @flow
import React from 'react'
import { Divider } from 'semantic-ui-react'
import AddTodo from './AddTodo'
import TodoList from './TodoList'

const PubSubTodoApp = () => (
  <div className="ui main text container main-content">
    <h1>Todo Example (GraphQL PubSub)</h1>
    <AddTodo />
    <Divider />
    <TodoList />
  </div>
)

export default PubSubTodoApp
