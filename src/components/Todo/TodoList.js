// @flow
import R from 'ramda'
import React, { Component, PropTypes } from 'react'
import { List } from 'semantic-ui-react'
import Todo from './Todo'

class TodoList extends Component {
  static propTypes = {
    todos: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
      })
    ).isRequired,
    onTodoClick: PropTypes.func.isRequired
  };

  handleTodoClick(event: Event, todoID: string) {
    event.preventDefault()
    const { onTodoClick } = this.props
    onTodoClick(todoID)
  }

  render() {
    const { todos } = this.props

    return (
      <List>
        {R.map(
          todo => (
            <Todo
              key={todo.id}
              onClick={(e) => {
                this.handleTodoClick(e, todo.id)
              }}
              todo={todo}
            />
          ),
          todos
        )}
      </List>
    )
  }
}

export default TodoList
