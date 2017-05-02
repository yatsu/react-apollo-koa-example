// @flow

// NOTE: this is a DB mock. Rewrite this for a real world app

import R from 'ramda'
import digest from './digest'

export type Todo = {
  id: string,
  text: string,
  completed: boolean
}

export type User = {
  username: string,
  password: ?string,
  admin: boolean
}

type UserMap = { [username: string]: User }

export const todos: Array<Todo> = [
  { id: '1', text: 'Make America great again', completed: false },
  { id: '2', text: 'Quit TPP', completed: false }
]

const users: UserMap = R.reduce((acc: UserMap, u: User) => R.assoc(u.username, u, acc), {}, [
  { username: 'alice', password: digest('alicepass'), admin: true, authenticatedBy: 'local' },
  { username: 'bob', password: digest('bobpass'), admin: false, authenticatedBy: 'local' }
])

export function getUser(username: string): User {
  return users[username]
}

export function getOrCreateUser(username: string, authenticatedBy: string): User {
  const existingUser = getUser(username)
  if (existingUser) return existingUser

  const user = { username, password: null, admin: false, authenticatedBy }
  users[username] = user
  return user
}
