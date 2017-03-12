import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Form, Message } from 'semantic-ui-react'
import { signin, clearAuthError } from '../../ducks/auth'

import './SigninApp.css'

class SigninApp extends Component {
  componentWillMount() {
    this.props.clearAuthError()
  }

  componentDidMount() {
    this.usernameField.focus()
  }

  componentWillUnmount() {
    this.usernameField.value = ''
    this.passwordField.value = ''
    this.props.clearAuthError()
  }

  handleSubmit(event) {
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
              ref={(elem) => { this.usernameField = elem }}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              disabled={authenticating}
              ref={(elem) => { this.passwordField = elem }}
            />
          </Form.Field>
          <Form.Field>
            <Button id="signinButton" positive onClick={e => this.handleSubmit(e)}>
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

const mapStatusToProps = state => ({
  authenticating: state.auth.get('authenticating'),
  error: state.auth.get('error')
})

const mapDispatchToProps = dispatch => ({
  onSubmit(username, password) {
    dispatch(signin(username, password))
  },

  clearAuthError() {
    dispatch(clearAuthError())
  }
})

export default connect(mapStatusToProps, mapDispatchToProps)(SigninApp)
