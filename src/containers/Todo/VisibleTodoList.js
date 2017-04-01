// @flow
import R from 'ramda'
import { connect } from 'react-redux'
import { toggleTodo, todosPath } from '../../ducks/todo'
import TodoList from '../../components/Todo/TodoList'

const mapStateToProps = (state: Object) => ({
  todos: R.values(R.path(todosPath, state.todo))
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onTodoClick(todoID) {
    dispatch(toggleTodo(todoID))
  }
})

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)

export default VisibleTodoList
