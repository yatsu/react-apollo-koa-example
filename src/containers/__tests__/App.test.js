import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'

function setup() {
  const app = shallow(<App />)

  return {
    app
  }
}

describe('<App/>', () => {
  const { app } = setup()

  it('renders div', () => {
    expect(app.find('div').hasClass('app')).toBe(true)
  })
})
