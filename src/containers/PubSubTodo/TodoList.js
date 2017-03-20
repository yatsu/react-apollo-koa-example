// @flow
import { PropTypes } from 'react'
import IPropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { subscribeTodos, unsubscribeTodos, toggleTodo } from '../../ducks/todoPubSub'
import TodoList from '../../components/TodoList'

class TodoListC extends TodoList {
  static propTypes = {
    todos: IPropTypes.listOf(
      IPropTypes.contains({
        id: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
      })
    ).isRequired,
    subscribeTodos: PropTypes.func.isRequired,
    unsubscribeTodos: PropTypes.func.isRequired,
    onTodoClick: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.subscribeTodos()
  }

  componentWillUnmount() {
    this.props.unsubscribeTodos()
  }
}

const mapStateToProps = (state: Object) => ({
  todos: state.todoPubSub.get('todos').toList()
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  subscribeTodos() {
    dispatch(subscribeTodos())
  },
  unsubscribeTodos() {
    dispatch(unsubscribeTodos())
  },
  onTodoClick(todoID: string) {
    dispatch(toggleTodo(todoID))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(TodoListC)
