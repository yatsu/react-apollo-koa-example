// @flow
import createDebug from 'debug'
import passport from 'koa-passport'
import digest from './digest'
import { env } from './utils'
import { getUser, getOrCreateUser } from './store'

const debug = createDebug('example:auth')

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
      debug('local auth succeeded', username)
      done(null, user)
    } else {
      debug('local auth failed')
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
      debug('google auth succeeded', profile)
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
      debug('facebokk auth succeeded', profile)
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
