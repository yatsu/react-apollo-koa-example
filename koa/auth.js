// @flow
import createDebug from 'debug'
import jwt from 'jsonwebtoken'
import passport from 'koa-passport'
import digest from './digest'
import env from './env'
import { getUser, getOrCreateUser } from './store'

const debugAuth = createDebug('example:auth')

passport.serializeUser((user, done) => {
  done(null, user.username)
})

passport.deserializeUser(async (username, done) => {
  const user = await getUser(username)
  done(null, user)
})

const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await getUser(username)
    if (user && username === user.username && digest(password) === user.password) {
      debugAuth('local auth succeeded', username)
      done(null, user)
    } else {
      debugAuth('local auth failed')
      done(null, false)
    }
  })
)

const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.use(
  new GoogleStrategy(
    {
      scope: ['profile'],
      clientID: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
    },
    async (accessToken, refreshToken, profile, done) => {
      debugAuth('google auth succeeded', profile)
      const user = await getOrCreateUser(profile.displayName, 'google')
      done(null, user, { accessToken, refreshToken })
    }
  )
)

const FacebookStrategy = require('passport-facebook').Strategy

passport.use(
  new FacebookStrategy(
    {
      profileFields: ['displayName'],
      clientID: env('FACEBOOK_CLIENT_ID'),
      clientSecret: env('FACEBOOK_CLIENT_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
    },
    async (accessToken, refreshToken, profile, done) => {
      debugAuth('facebokk auth succeeded', profile)
      const user = await getOrCreateUser(profile.displayName, 'facebook')
      done(null, user, { accessToken, refreshToken })
    }
  )
)

const TwitterStrategy = require('passport-twitter').Strategy

passport.use(
  new TwitterStrategy(
    {
      consumerKey: env('TWITTER_CUSTOMER_KEY'),
      consumerSecret: env('TWITTER_CUSTOMER_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await getOrCreateUser(profile.username, 'twitter')
      done(null, user, { accessToken, refreshToken })
    }
  )
)

function generateTokens(username: string, ctx: Object): Object {
  const accessExp = ctx.request.get('X-ACCESS-TOKEN-EXPIRES-IN')
  const refreshExp = ctx.request.get('X-REFRESH-TOKEN-EXPIRES-IN')
  debugAuth('accessExp: %s', accessExp)
  debugAuth('refreshExp: %s', refreshExp)
  const accessToken = jwt.sign(
    { user: { username, admin: env('USER_ADMIN') === 'true' }, type: 'access' },
    env('SESSION_SECRET'),
    { expiresIn: accessExp || '2h' }
  )
  const refreshToken = jwt.sign(
    { user: { username, admin: env('USER_ADMIN') === 'true' }, type: 'refresh' },
    env('SESSION_SECRET'),
    { expiresIn: refreshExp || '60d' }
  )
  return { accessToken, refreshToken }
}

export async function localSignin(ctx: Object, next: () => void) {
  await passport.authenticate('local', async (err, user) => {
    if (user === false) {
      ctx.body = {
        error: {
          type: 'Local',
          message: 'Username or password incorrect.',
          status: 401
        }
      }
      ctx.status = 401
    } else {
      const tokens = generateTokens(user.username, ctx)
      await ctx.login(user, tokens)
      ctx.body = tokens
      ctx.status = 201
    }
  })(ctx, next)
}

export async function googleSignin(ctx: Object, next: () => void) {
  ctx.session.authenticatingService = 'google'
  await passport.authenticate('google')(ctx, next)
}

export async function facebookSignin(ctx: Object, next: () => void) {
  ctx.session.authenticatingService = 'facebook'
  await passport.authenticate('facebook')(ctx, next)
}

export async function twitterSignin(ctx: Object, next: () => void) {
  ctx.session.authenticatingService = 'twitter'
  await passport.authenticate('twitter')(ctx, next)
}

export async function signinCallback(ctx: Object, next: () => void) {
  const error = {
    type: 'Social',
    message: '',
    status: 401
  }
  const service = ctx.session.authenticatingService
  if (!service) {
    error.message = 'An attempt was made to continue a social sign in without the initial sequence.'
    ctx.body = { error }
    ctx.status = 401
  }
  await passport.authenticate(service, async (err, user) => {
    if (user === false || err !== null) {
      error.message = `Social sign in failed: ${err}`
      ctx.body = { error }
      ctx.status = 401
    } else {
      const tokens = generateTokens(user.username, ctx)
      await ctx.login(user, tokens)
      ctx.body = tokens
      ctx.status = 201
    }
  })(ctx, next)
}

export async function signinFailed(ctx: Object) {
  delete ctx.session.authenticatingService
  ctx.status = 201
}

export async function signout(ctx: Object) {
  ctx.logout()
  ctx.body = {}
  ctx.status = 201
}
