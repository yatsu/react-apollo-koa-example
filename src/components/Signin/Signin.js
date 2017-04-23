// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Container, Form, Icon, Message } from 'semantic-ui-react'

import './Signin.css'

class Signin extends Component {
  usernameField: any;
  passwordField: any;

  handleLocalSubmit(event: Event) {
    event.preventDefault()
    this.props.onLocalSubmit(this.usernameField.value, this.passwordField.value)
  }

  handleSocialSubmit(event: Event, service: string) {
    event.preventDefault()
    window.location.replace(`/auth/${service}/signin`)
  }

  renderStatus() {
    const { authenticating } = this.props
    if (authenticating === false) return null

    return <Message><p>Signing in...</p></Message>
  }

  renderError() {
    const { error } = this.props
    if (error) {
      return (
        <Message negative>
          <Message.Header>{error.type} signin failed with a {error.status} status!</Message.Header>
          <p>{error.message}</p>
        </Message>
      )
    }
    return ''
  }

  render() {
    const { authenticating } = this.props

    return (
      <Container text className="main main-content signin">
        <h1>Sign in</h1>
        <Form onSubmit={e => this.handleLocalSubmit(e)}>
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
              id="localSigninButton"
              positive
              disabled={authenticating}
              onClick={e => this.handleLocalSubmit(e)}
            >
              Sign in
            </Button>
          </Form.Field>
        </Form>
        <h4 className="ui dividing header">
          Sign in with a Social Media Account
        </h4>
        <Button
          id="googleSigninButton"
          disabled={authenticating}
          className="google plus"
          onClick={e => this.handleSocialSubmit(e, 'google')}
        >
          <Icon className="google plus" />
          Google Plus
        </Button>
        <Button
          id="facebookSigninButton"
          disabled={authenticating}
          className="facebook"
          onClick={e => this.handleSocialSubmit(e, 'facebook')}
        >
          <i className="facebook icon" />
          Facebook
        </Button>
        <Button
          id="twitterSigninButton"
          disabled={authenticating}
          className="twitter"
          onClick={e => this.handleSocialSubmit(e, 'twitter')}
        >
          <i className="twitter icon" />
          Twitter
        </Button>
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
  onLocalSubmit: PropTypes.func.isRequired
}

export default Signin
