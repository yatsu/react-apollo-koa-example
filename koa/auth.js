// @flow
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import passport from 'koa-passport'

require('dotenv').load()

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
    username: process.env.USERNAME,
    password: digest(process.env.USER_PASSWORD),
    admin: process.env.USER_ADMIN
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  await fetchUser(id).then(user => done(null, user)).catch(err => done(err))
})

function generateTokens(username: string): Object {
  const accessToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'access' },
    process.env.SESSION_SECRET,
    { expiresIn: '2h' }
  )
  const refreshToken = jwt.sign(
    { user: { username, admin: process.env.USER_ADMIN === 'true' }, type: 'refresh' },
    process.env.SESSION_SECRET,
    { expiresIn: '60d' }
  )
  return { accessToken, refreshToken }
}

const LocalStrategy = require('passport-local').Strategy

passport.use(
  new LocalStrategy((username, password, next) => {
    fetchUser(username)
      .then((user) => {
        if (username === user.username && digest(password) === user.password) {
          next(null, user, generateTokens(username))
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
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://${process.env.SERVER_HOST}:${process.env.PROXY_PORT}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, generateTokens(user.username))
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
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `http://${process.env.SERVER_HOST}:${process.env.PROXY_PORT}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, generateTokens(user.username))
        })
        .catch(err => next(err))
    }
  )
)

const TwitterStrategy = require('passport-twitter').Strategy

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CUSTOMER_KEY,
      consumerSecret: process.env.TWITTER_CUSTOMER_SECRET,
      callbackURL: `http://${process.env.SERVER_HOST}:${process.env.PROXY_PORT}/signin`
    },
    (accessToken, refreshToken, profile, next) => {
      fetchUser(profile)
        .then((user) => {
          next(null, user, generateTokens(user.username))
        })
        .catch(err => next(err))
    }
  )
)
