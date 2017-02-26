import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import TodoField from '../../components/TodoField'
import { createTodo } from '../../ducks/todo'

class AddTodoContainer extends Component {
  static propTypes = {
    onCreateTodo: PropTypes.func.isRequired
  }

  render() {
    const { onCreateTodo } = this.props

    return (
      <TodoField onSubmit={onCreateTodo}/>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateTodo: (todo) => {
      dispatch(createTodo(todo))
    }
  }
}

const AddTodo = connect(mapStateToProps, mapDispatchToProps)(AddTodoContainer)

export default AddTodo
