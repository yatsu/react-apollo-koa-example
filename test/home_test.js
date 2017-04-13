import Nightmare from 'nightmare'
import { expect } from 'chai'

describe('The home page', () => {
  it('has title "React Apollo Koa Example"', (done) => {
    const nightmare = Nightmare()
    nightmare
      .goto('http://localhost:3000')
      .evaluate(() => document.title)
      .end()
      .then((title) => {
        expect(title).to.equal('React Apollo Koa Example')
        done()
      })
      .catch((error) => {
        console.error('Error', error)
      })
  })

  it('can have debug in localStorage', (done) => {
    const nightmare = Nightmare()
    nightmare
      .goto('http://localhost:3000')
      .evaluate(() => {
        localStorage.setItem('debug', 'example:*')
        return localStorage.getItem('debug')
      })
      .end()
      .then((debug) => {
        expect(debug).to.equal('example:*')
        done()
      })
      .catch((error) => {
        console.error('Error', error)
      })
  })
})
