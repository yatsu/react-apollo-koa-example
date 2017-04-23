import Nightmare from 'nightmare'
import { expect } from 'chai'
import { BASE_URL } from './test_config'

describe('The home page', () => {
  it('has title "React Apollo Koa Example"', async () => {
    const title = await Nightmare().goto(`${BASE_URL}`).evaluate(() => document.title).end()
    expect(title).to.equal('React Apollo Koa Passport Example')
  })
})
