import React, { Component, PropTypes } from 'react'
import { Button, Form } from 'semantic-ui-react'

class TodoField extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.input.focus()
  }

  handleSubmit(event) {
    const { onSubmit } = this.props

    event.preventDefault()
    if (!this.input.value.trim()) {
      return
    }
    onSubmit(this.input.value)
    this.input.value = ''
    this.input.focus()
  }

  render() {
    return (
      <Form onSubmit={e => this.handleSubmit(e)}>
        <Form.Field>
          <input
            ref={(input) => { this.input = input }}
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
