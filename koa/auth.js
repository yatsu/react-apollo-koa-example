// @flow
import crypto from 'crypto'
import passport from 'koa-passport'
import { env } from './utils'

function digest(password: string) {
  return crypto.createHash('sha1').update(password).digest('hex')
}

async function fetchUser(info: Object | string | number, service?: string) {
  // TODO: Implement User Fetch Logic based on Social Media Service Login profile,
  //       Username or ID
  switch (service) {
    case 'google':
    case 'facebook':
    case 'twitter':
    default:
  }
  return {
    id: 1,
    username: env.get('USERNAME', ''),
    password: digest(env.get('USER_PASSWORD', '')),
    admin: env.get('USER_ADMIN', '')
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  await fetchUser(id).then(user => done(null, user)).catch(err => done(err))
})

const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy((username, password, next) => {
    fetchUser(username)
      .then((user) => {
        if (username === user.username && digest(password) === user.password) {
          next(null, user)
        } else {
          next(null, false)
        }
      })
      .catch(err => next(err))
  })
)

const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.use(
  new GoogleStrategy(
    {
      scope: ['email', 'profile'],
      clientID: env.get('GOOGLE_CLIENT_ID', ''),
      clientSecret: env.get('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: `http://${env.get('SERVER_HOST')}:${env.get('PROXY_PORT')}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, { accessToken, refreshToken })
        })
        .catch(err => next(err))
    }
  )
)

const FacebookStrategy = require('passport-facebook').Strategy

passport.use(
  new FacebookStrategy(
    {
      profileFields: ['id', 'displayName', 'photos', 'email'],
      clientID: env.get('FACEBOOK_CLIENT_ID', ''),
      clientSecret: env.get('FACEBOOK_CLIENT_SECRET', ''),
      callbackURL: `http://${env.get('SERVER_HOST', '')}:${env.get('PROXY_PORT', '')}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, { accessToken, refreshToken })
        })
        .catch(err => next(err))
    }
  )
)

const TwitterStrategy = require('passport-twitter').Strategy

passport.use(
  new TwitterStrategy(
    {
      consumerKey: env.get('TWITTER_CUSTOMER_KEY', ''),
      consumerSecret: env.get('TWITTER_CUSTOMER_SECRET', ''),
      callbackURL: `http://${env.get('SERVER_HOST', '')}:${env.get('PROXY_PORT', '')}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, { accessToken, refreshToken })
        })
        .catch(err => next(err))
    }
  )
)
