// @flow
import crypto from 'crypto'
import createDebug from 'debug'
import jwt from 'jsonwebtoken'

const debugAuth = createDebug('example:auth')

function digest(password: string) {
  return crypto.createHash('sha1').update(password).digest('hex')
}

function authError(status: number = 401, msg: string = 'Username or password incorrect') {
  const error: Object = new Error(msg)
  error.status = status
  throw error
}

export async function signin(ctx: Object) {
  const { username, password } = ctx.request.body
  if (!username || !password) {
    authError(400, 'Must provide username and password')
  }
  const accessExp = ctx.request.get('X-ACCESS-TOKEN-EXPIRES-IN')
  const refreshExp = ctx.request.get('X-REFRESH-TOKEN-EXPIRES-IN')
  debugAuth('accessExp: %s', accessExp)
  debugAuth('refreshExp: %s', refreshExp)

  const storedPassword = digest(process.env.USER_PASSWORD || '')
  if (!storedPassword || storedPassword !== digest(password)) {
    authError()
  }

  const accessToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: accessExp || '2h' }
  )
  const refreshToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: refreshExp || '60d' }
  )
  ctx.body = { accessToken, refreshToken }
}

export async function signout(ctx: Object) {
  ctx.body = {}
}
