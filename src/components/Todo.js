import classNames from 'classnames'
import React, { PureComponent, PropTypes } from 'react'
import IPropTypes from 'react-immutable-proptypes'
import { Checkbox, List } from 'semantic-ui-react'
import './Todo.css'

class Todo extends PureComponent {
  static propTypes = {
    todo: IPropTypes.contains({
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired
    }).isRequired,
    onClick: PropTypes.func.isRequired
  }

  render() {
    const { todo, onClick } = this.props
    const completed = todo.get('completed')
    const text = todo.get('text')

    return (
      <List.Item className={classNames({ completed })}>
        <Checkbox label={text} checked={completed} onClick={onClick} />
      </List.Item>
    )
  }
}

export default Todo
