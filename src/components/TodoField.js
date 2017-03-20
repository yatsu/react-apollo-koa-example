// @flow
import React, { Component, PropTypes } from 'react'
import { Button, Form } from 'semantic-ui-react'

class TodoField extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.inputField.focus()
  }

  inputField: any;

  handleSubmit(event: Event) {
    const { onSubmit } = this.props

    event.preventDefault()
    if (!this.inputField.value.trim()) {
      return
    }
    onSubmit(this.inputField.value)
    this.inputField.value = ''
    this.inputField.focus()
  }

  render() {
    return (
      <Form onSubmit={e => this.handleSubmit(e)}>
        <Form.Field>
          <input
            ref={(elem) => {
              this.inputField = elem
            }}
            name="add-todo"
            placeholder="Input Todo"
          />
        </Form.Field>
        <Form.Field>
          <Button primary>Add Todo</Button>
        </Form.Field>
      </Form>
    )
  }
}

export default TodoField
