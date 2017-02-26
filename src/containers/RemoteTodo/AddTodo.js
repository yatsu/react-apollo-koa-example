import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import TodoField from '../../components/TodoField'

class AddTodo extends Component {
  static propTypes = {
    onCreateTodo: PropTypes.func.isRequired,
    refetchTodoList: PropTypes.func.isRequired
  }

  render() {
    const { onCreateTodo } = this.props

    return (
      <TodoField onSubmit={onCreateTodo}/>
    )
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

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, ownProps, {
    onCreateTodo: ownProps.createTodo
  })
}

export default compose(
  graphql(addTodoMutation, {
    props: ({ ownProps, mutate }) => {
      return {
        createTodo: (text) => {
          mutate({ variables: { text } }).then(() => {
            ownProps.refetchTodoList()
          })
        }
      }
    }
  }),
  connect(null, null, mergeProps)
)(AddTodo)
