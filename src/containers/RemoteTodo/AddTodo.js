import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import TodoField from '../../components/TodoField'

class AddTodo extends PureComponent {
  static propTypes = {
    onCreateTodo: PropTypes.func.isRequired
  };

  render() {
    const { onCreateTodo } = this.props

    return <TodoField onSubmit={onCreateTodo} />
  }
}

const addTodoMutation = gql`
  mutation addTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, ownProps, {
    onCreateTodo: ownProps.createTodo
  })

export default compose(
  graphql(addTodoMutation, {
    props: ({ ownProps, mutate }) => ({
      createTodo(text) {
        mutate({ variables: { text } }).then(() => {
          ownProps.refetchTodoList()
        })
      }
    })
  }),
  connect(null, null, mergeProps)
)(AddTodo)
