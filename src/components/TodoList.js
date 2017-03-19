import React, { Component, PropTypes } from 'react'
import IPropTypes from 'react-immutable-proptypes'
import { List } from 'semantic-ui-react'
import Todo from './Todo'

class TodoList extends Component {
  static propTypes = {
    todos: IPropTypes.listOf(
      IPropTypes.contains({
        id: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
      })
    ).isRequired,
    onTodoClick: PropTypes.func.isRequired
  };

  handleTodoClick(event, todoId) {
    event.preventDefault()
    const { onTodoClick } = this.props
    onTodoClick(todoId)
  }

  render() {
    const { todos } = this.props

    return (
      <List>
        {todos.map(todo => (
          <Todo
            key={todo.get('id')}
            onClick={(e) => {
              this.handleTodoClick(e, todo.get('id'))
            }}
            todo={todo}
          />
        ))}
      </List>
    )
  }
}

export default TodoList
