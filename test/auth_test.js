import Nightmare from 'nightmare'
import { expect } from 'chai'
import { BASE_URL } from './test_config'

describe('Todo page w/o auth', () => {
  it('redirects the req to /signin', async () => {
    const path = await Nightmare().goto(`${BASE_URL}/todo`).path().end()
    expect(path).to.equal('/signin')
  })
})

describe('Signing in', () => {
  it('fails with an incorrect password', async () => {
    const { message, path } = await Nightmare()
      .goto(`${BASE_URL}/signin`)
      .type('input[name=username]', 'user1')
      .type('input[name=password]', 'incorrect')
      .click('#localSigninButton')
      .wait('.negative')
      .evaluate(() => ({
        message: document.querySelector('.negative p').innerText,
        path: document.location.pathname
      }))
      .end()
    expect(message).to.equal('User Name or Password Incorrect.')
    expect(path).to.equal('/signin')
  })

  it('redirects /signin to / after auth', async () => {
    const { username, path } = await Nightmare()
      .goto(`${BASE_URL}/signin`)
      .type('input[name=username]', 'user1')
      .type('input[name=password]', 'user1pass')
      .click('#localSigninButton')
      .wait('#username')
      .evaluate(() => ({
        username: document.querySelector('#username').innerText,
        path: document.location.pathname
      }))
      .end()
    expect(username).to.equal('user1')
    expect(path).to.equal('/')
  })

  it('redirects /todo to /todo after auth', async () => {
    const { username, path } = await Nightmare()
      .goto(`${BASE_URL}/todo`)
      .type('input[name=username]', 'user1')
      .type('input[name=password]', 'user1pass')
      .click('#localSigninButton')
      .wait('#username')
      .evaluate(() => ({
        username: document.querySelector('#username').innerText,
        path: document.location.pathname
      }))
      .end()
    expect(username).to.equal('user1')
    expect(path).to.equal('/todo')
  })
})
