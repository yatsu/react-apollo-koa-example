import Nightmare from 'nightmare'
import { expect } from 'chai'
import jwtDecode from 'jwt-decode'
import uuid from 'uuid'
import { BASE_URL } from './test_config'

describe('Refreshing token caused by token expiration', () => {
  describe('with a valid refresh token', () => {
    it('succeeds and retrying previous request also succeeds', async () => {
      const todo = uuid.v4()
      const { accessToken, refreshToken } = await Nightmare()
        .goto(`${BASE_URL}/todo-pubsub`)
        .evaluate(() => {
          localStorage.setItem(
            'devHeaders',
            JSON.stringify({
              'X-ACCESS-TOKEN-EXPIRES-IN': '-1000',
              'X-REFRESH-TOKEN-EXPIRES-IN': '5000'
            })
          )
        })
        .insert('input[name=username]', 'alice')
        .insert('input[name=password]', 'alicepass')
        .click('#signin-button')
        .evaluate(() => {
          localStorage.removeItem('devHeaders')
        })
        .wait('input[name=add-todo]', todo)
        .insert('input[name=add-todo]', todo)
        .click('#add-todo-button')
        .wait(1000)
        .evaluate(() => ({
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        }))
        .end()
      const at = jwtDecode(accessToken)
      const rt = jwtDecode(refreshToken)
      expect(at.exp - at.iat).to.equal(60 * 60 * 2)
      expect(rt.exp - rt.iat).to.equal(5)
    })
  })

  describe('with an expired refresh token', () => {
    it('fails and the user will be signed out', async () => {
      const todo = uuid.v4()
      const { path } = await Nightmare()
        .goto(`${BASE_URL}/todo-pubsub`)
        .evaluate(() => {
          localStorage.setItem(
            'devHeaders',
            JSON.stringify({
              'X-ACCESS-TOKEN-EXPIRES-IN': '-1000',
              'X-REFRESH-TOKEN-EXPIRES-IN': '-1000'
            })
          )
        })
        .insert('input[name=username]', 'alice')
        .insert('input[name=password]', 'alicepass')
        .click('#signin-button')
        .evaluate(() => {
          localStorage.removeItem('devHeaders')
        })
        .wait('input[name=add-todo]', todo)
        .insert('input[name=add-todo]', todo)
        .click('#add-todo-button')
        .wait(1000)
        .evaluate(() => ({
          path: document.location.pathname
        }))
        .end()
      expect(path).to.equal('/signin') // redirected
    })
  })
})
