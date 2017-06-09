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
  const id = 1
  const user = {
    id,
    username: env('USERNAME'),
    password: digest(env('USER_PASSWORD')),
    admin: env('USER_ADMIN')
  }
  return user
}

const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy({ session: false }, (username, password, next) => {
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
      session: false,
      scope: ['email', 'profile'],
      clientID: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
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
      session: false,
      profileFields: ['id', 'displayName', 'photos', 'email'],
      clientID: env('FACEBOOK_CLIENT_ID'),
      clientSecret: env('FACEBOOK_CLIENT_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
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
      session: false,
      consumerKey: env('TWITTER_CUSTOMER_KEY'),
      consumerSecret: env('TWITTER_CUSTOMER_SECRET'),
      callbackURL: `http://${env('SERVER_HOST')}:${env('PROXY_PORT')}/signin`
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

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

passport.use(
  new JwtStrategy(
    {
      session: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: env('JWT_SECRET'),
      issuer: env('JWT_ISSUER'),
      audience: env('JWT_AUDIENCE')
    },
    (payload, next) => {
      fetchUser(payload)
        .then((user) => {
          next(null, user)
        })
        .catch(err => next(err, false))
    }
  )
)
