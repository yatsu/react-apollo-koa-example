import React, {Component} from 'react'
import { Link } from 'react-router'
import logo from '../logo.svg'

class Header extends Component {
  render() {
    return (
      <div className="ui fixed inverted menu">
        <div className="ui container">
          <Link to="/" className="header item">
            <img src={logo} className="app-logo" alt="logo"/>
            Example App
          </Link>
          <Link to="/todo" className="item">Local</Link>
          <Link to="/todo-remote" className="item">GraphQL</Link>
          <Link to="/todo-pubsub" className="item">GraphQL Subscription</Link>
        </div>
      </div>
    )
  }
}

export default Header
