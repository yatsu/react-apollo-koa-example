// @flow
import React, { Component, PropTypes } from 'react'
import { Button, Form, Message } from 'semantic-ui-react'

import './Signin.css'

class Signin extends Component {
  static propTypes = {
    authenticating: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
  };

  static defaultProps = {
    error: null
  };

  usernameField: any;
  passwordField: any;

  handleSubmit(event: Event) {
    event.preventDefault()
    this.props.onSubmit(this.usernameField.value, this.passwordField.value)
  }

  renderStatus() {
    const { authenticating } = this.props
    if (authenticating === false) return ''

    return <Message><p>Signing in...</p></Message>
  }

  renderError() {
    const { error } = this.props
    if (!error) return ''

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
      <div className="ui main text container main-content signin">
        <h1>Sign in</h1>
        <Form onSubmit={e => this.handleSubmit(e)}>
          <Form.Field>
            <label htmlFor="username">Username</label>
            <input
              id="username"
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
              id="password"
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
              id="signinButton"
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
      </div>
    )
  }
}

export default Signin
