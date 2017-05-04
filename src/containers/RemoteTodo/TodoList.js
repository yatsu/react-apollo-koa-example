// @flow
import R from 'ramda'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchTodos, toggleTodo } from '../../ducks/todoRemote'
import TodoList from '../../components/Todo/TodoList'

class TodoListContainer extends TodoList {
  componentDidMount() {
    this.props.fetchTodos()
  }
}

TodoListContainer.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired,
  fetchTodos: PropTypes.func.isRequired,
  onTodoClick: PropTypes.func.isRequired
}

const mapStateToProps = (state: Object) => ({
  todos: R.values(R.prop('todos', state.todoRemote))
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchTodos() {
    dispatch(fetchTodos())
  },
  onTodoClick(todoID: string) {
    dispatch(toggleTodo(todoID))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(TodoListContainer)
