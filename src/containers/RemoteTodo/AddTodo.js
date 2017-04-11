// @flow
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import TodoField from '../../components/Todo/TodoField'

class AddTodo extends PureComponent {
  render() {
    const { createTodo } = this.props

    return <TodoField onSubmit={createTodo} />
  }
}

AddTodo.propTypes = {
  createTodo: PropTypes.func.isRequired
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
