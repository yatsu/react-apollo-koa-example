// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Container, Form, Message } from 'semantic-ui-react'

import './Signin.css'

class Signin extends Component {
  usernameField: any;
  passwordField: any;

  handleSubmit(event: Event) {
    event.preventDefault()
    this.props.onSubmit(this.usernameField.value, this.passwordField.value)
  }

  renderStatus() {
    const { authenticating } = this.props
    if (authenticating === false) return null

    return <Message><p>Signing in...</p></Message>
  }

  renderError() {
    const { error } = this.props
    if (!error) return null

    return (
      <Message negative>
        <Message.Header>Sign in failed</Message.Header>
        <p>{error}</p>
      </Message>
    )
  }

  render() {
    const { authenticating } = this.props

    return (
      <Container text className="main main-content signin">
        <h1>Sign in</h1>
        <Form onSubmit={e => this.handleSubmit(e)}>
          <Form.Field>
            <label htmlFor="username">Username</label>
            <input
              name="username"
              type="text"
              disabled={authenticating}
              ref={(elem) => {
                this.usernameField = elem
              }}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              disabled={authenticating}
              ref={(elem) => {
                this.passwordField = elem
              }}
            />
          </Form.Field>
          <Form.Field>
            <Button
              id="signin-button"
              positive
              disabled={authenticating}
              onClick={e => this.handleSubmit(e)}
            >
              Sign in
            </Button>
          </Form.Field>
        </Form>
        <div>{authenticating}</div>
        {this.renderStatus()}
        {this.renderError()}
      </Container>
    )
  }
}

Signin.propTypes = {
  authenticating: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired
}

export default Signin
