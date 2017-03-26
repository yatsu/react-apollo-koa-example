// @flow
import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import TodoField from '../../components/Todo/TodoField'
import { createTodo } from '../../ducks/todoPubSub'

class AddTodo extends PureComponent {
  static propTypes = {
    onCreateTodo: PropTypes.func.isRequired
  };

  render() {
    const { onCreateTodo } = this.props

    return <TodoField onSubmit={onCreateTodo} />
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCreateTodo(text: string) {
    dispatch(createTodo({ text }))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(AddTodo)
