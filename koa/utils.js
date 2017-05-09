// @flow
import jwt from 'jsonwebtoken'
import createDebug from 'debug'
import dotenv from 'dotenv'

const debugAuth = createDebug('example:auth')

const denv = dotenv.config().parsed
export function env(key: string, def?: string = ''): string {
  return denv[key] !== undefined ? denv[key] : def
}

export async function errorHandler(ctx: Object, next: () => {}) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.app.emit('error', err, ctx)
    ctx.type = 'application/json'
    ctx.body = { error: { message: err.message, status: ctx.status } }
  }
}

export function generateTokens(username: string, ctx: Object): Object {
  const accessExp = ctx.request.get('X-ACCESS-TOKEN-EXPIRES-IN')
  const refreshExp = ctx.request.get('X-REFRESH-TOKEN-EXPIRES-IN')
  debugAuth('accessExp: %s', accessExp)
  debugAuth('refreshExp: %s', refreshExp)
  const accessToken = jwt.sign(
    { user: { username, admin: env('USER_ADMIN', '') === 'true' }, type: 'access' },
    env('JWT_SECRET'),
    {
      issuer: env('JWT_ISSUER'),
      audience: env('JWT_AUDIENCE'),
      expiresIn: accessExp || '2h'
    }
  )
  const refreshToken = jwt.sign(
    { user: { username, admin: env('USER_ADMIN', '') === 'true' }, type: 'refresh' },
    env('JWT_SECRET'),
    {
      issuer: env('JWT_ISSUER'),
      audience: env('JWT_AUDIENCE'),
      expiresIn: refreshExp || '60d'
    }
  )
  return { accessToken, refreshToken }
}

export function extractToken(ctx: Object): string | null {
  const authHeader = ctx.request.get('Authorization')
  const match = /^Bearer (\S+)/.exec(authHeader)
  if (!authHeader || !match) {
    return null
  }
  return match[1]
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, env('JWT_SECRET'), {
      issuer: env('JWT_ISSUER'),
      audience: env('JWT_AUDIENCE')
    })
    return payload.user
  } catch (err) {
    return null
  }
}
