import React, { PureComponent, PropTypes } from 'react'
import Header from './Header'
import Footer from './Footer'

import './App.css'

class App extends PureComponent {
  static propTypes = {
    children: PropTypes.element
  };

  static defaultProps = {
    children: null
  };

  render() {
    const { children } = this.props

    return (
      <div className="app">
        <Header />
        {children}
        <Footer />
      </div>
    )
  }
}

export default App
