import { connect } from 'react-redux'
import { toggleTodo } from '../../ducks/todo'
import TodoList from '../../components/TodoList'

const mapStateToProps = state => ({
  todos: state.todo.get('todos')
})

const mapDispatchToProps = dispatch => ({
  onTodoClick(todoId) {
    dispatch(toggleTodo(todoId))
  }
})

const VisibleTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)

export default VisibleTodoList
