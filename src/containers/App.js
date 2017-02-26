import React, { Component } from 'react'
import Header from './Header'
import Footer from './Footer'
import './App.css'

class App extends Component {
  render() {
    const { children } = this.props

    return (
      <div className="app">
        <Header/>
        {children}
        <Footer/>
      </div>
    )
  }
}

export default App
