// @flow
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Button, Icon, Menu } from 'semantic-ui-react'
import classnames from 'classnames'
import { signout } from '../ducks/auth'

import logo from '../logo.svg'
import './Header.css'

class Header extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    username: PropTypes.string,
    admin: PropTypes.bool.isRequired,
    signout: PropTypes.func.isRequired
  };

  static defaultProps = {
    username: null
  };

  active(path) {
    return this.props.path === `/${path}`
  }

  handleSignout(event) {
    event.preventDefault()
    this.props.signout()
  }

  renderUser() {
    const { username, admin } = this.props
    if (!username) return ''
    const color = admin ? 'red' : 'green'
    return (
      <Menu.Item id="username">
        <Icon name="user" color={color} />
        {username}
      </Menu.Item>
    )
  }

  renderAuthButton() {
    const { username } = this.props
    if (!username) {
      return (
        <Link id="signinLink" to="/signin" className="item">
          <Button>
            <Icon name="sign in" />Sign in
          </Button>
        </Link>
      )
    }
    return (
      <Menu.Item>
        <Button id="signinLink" onClick={e => this.handleSignout(e)}>
          <Icon name="log out" />Sign out
        </Button>
      </Menu.Item>
    )
  }

  render() {
    return (
      <Menu inverted size="small" className="header">
        <Link to="/" className="item header-logo">
          <img src={logo} className="app-logo" alt="logo" />
          Example App
        </Link>
        <Link to="/todo" className={classnames('item', { active: this.active('todo') })}>
          Local
        </Link>
        <Link
          to="/todo-remote"
          className={classnames('item', { active: this.active('todo-remote') })}
        >
          GraphQL
        </Link>
        <Link
          to="/todo-pubsub"
          className={classnames('item', { active: this.active('todo-pubsub') })}
        >
          GraphQL Subscription
        </Link>
        <Menu.Menu position="right">
          {this.renderUser()}
          {this.renderAuthButton()}
        </Menu.Menu>
      </Menu>
    )
  }
}

const mapStateToProps = state => ({
  path: state.routing.locationBeforeTransitions.pathname,
  username: state.auth.get('username'),
  admin: state.auth.get('admin')
})

const mapDispatchToProps = dispatch => ({
  signout() {
    dispatch(signout())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
