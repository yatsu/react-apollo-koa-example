// @flow
import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import TodoField from '../../components/TodoField'

class AddTodo extends PureComponent {
  static propTypes = {
    createTodo: PropTypes.func.isRequired
  };

  render() {
    const { createTodo } = this.props

    return <TodoField onSubmit={createTodo} />
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

const mergeProps = (stateProps: Object, dispatchProps: Object, ownProps: Object) => ownProps

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
  connect(() => ({}), () => ({}), mergeProps)
)(AddTodo)
