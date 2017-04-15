import Nightmare from 'nightmare'
import { expect } from 'chai'
import { BASE_URL } from './test_config'

describe('Todo page w/o auth', () => {
  it('redirects the req to /signin', async () => {
    const path = await Nightmare().goto(`${BASE_URL}/todo`).path().end()
    expect(path).to.equal('/signin')
  })
})
