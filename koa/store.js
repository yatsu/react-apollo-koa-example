// @flow

// NOTE: this is a DB mock. Rewrite this for a real world app

import R from 'ramda'
import digest from './digest'
import type { Todo, User } from '../src/types'

type UserMap = { [username: string]: User }

export const todos: Array<Todo> = [
  { id: '1', text: 'Make America great again', completed: false },
  { id: '2', text: 'Quit TPP', completed: false }
]

const users: UserMap = R.reduce((acc: UserMap, u: User) => R.assoc(u.username, u, acc), {}, [
  { username: 'alice', password: digest('alicepass'), admin: true },
  { username: 'bob', password: digest('bobpass'), admin: false }
])

export function getUser(username: string): User {
  return users[username]
}
