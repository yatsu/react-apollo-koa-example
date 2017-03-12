import { fromJS } from 'immutable'
import { createLogic } from 'redux-logic'
import jwtDecode from 'jwt-decode'

// Actions

const SIGNIN = 'auth/SIGNIN'
const SIGNIN_SUCCEEDED = 'auth/SIGNIN_SUCCEEDED'
const SIGNIN_FAILED = 'auth/SIGNIN_FAILED'
const SIGNIN_RESUME = 'auth/SIGNIN_RESUME'
const SIGNOUT = 'auth/SIGNOUT'
const SIGNOUT_SUCCEEDED = 'auth/SIGNOUT_SUCCEEDED'
const SIGNOUT_FAILED = 'auth/SIGNOUT_FAILED'
const CLEAR_AUTH_ERROR = 'auth/CLEAR_AUTH_ERROR'

// Reducer

const initialState = fromJS({
  username: null,
  admin: false,
  authenticating: false,
  error: null
})

export function authReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SIGNIN:
      return state
        .set('authenticating', true)
        .set('error', null)
    case SIGNIN_SUCCEEDED:
      return state
        .set('authenticating', false)
        .set('username', action.payload.username)
        .set('admin', action.payload.admin)
    case SIGNIN_FAILED:
      return state
        .set('authenticating', false)
        .set('error', action.payload.error.message)
    case SIGNIN_RESUME:
      return state
        .set('authenticating', false)
        .set('username', action.payload.username)
        .set('admin', action.payload.admin)
    case SIGNOUT:
      return state
        .set('authenticating', false)
        .set('username', null)
        .set('admin', false)
    case SIGNOUT_SUCCEEDED:
      return state
    case SIGNOUT_FAILED:
      return state
    case CLEAR_AUTH_ERROR:
      return state
        .set('authenticating', false)
        .set('error', null)
    default:
      return state
  }
}

// Action Creators

export function signin(username, password) {
  return {
    type: SIGNIN,
    username,
    password
  }
}

export function signinSucceeded(payload) {
  const { accessToken } = payload
  const { user } = jwtDecode(accessToken)

  return {
    type: SIGNIN_SUCCEEDED,
    payload: {
      username: user.username,
      admin: user.admin
    }
  }
}

export function signinFailed(error) {
  return {
    type: SIGNIN_FAILED,
    payload: {
      error: {
        message: error.xhr.response.error.message,
        status: error.status
      }
    }
  }
}

export function signinResume() {
  const accessToken = localStorage.getItem('accessToken')
  const { user } = jwtDecode(accessToken)

  return {
    type: SIGNIN_RESUME,
    payload: {
      username: user.username,
      admin: user.admin
    }
  }
}

export function signout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')

  return {
    type: SIGNOUT
  }
}

export function signoutSucceeded() {
  return {
    type: SIGNOUT_SUCCEEDED
  }
}

export function signoutFailed() {
  return {
    type: SIGNOUT_FAILED
  }
}

export function clearAuthError() {
  return {
    type: CLEAR_AUTH_ERROR
  }
}

// Logic

export const signinLogic = createLogic({
  type: SIGNIN,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: signinSucceeded,
    failType: signinFailed
  },

  process({ action, webClient }) {
    const { username, password } = action
    const body = { username, password }
    const headers = { 'Content-Type': 'application/json' }
    return webClient.post('api/signin', body, headers, false)
      .map(payload => {
        const { accessToken, refreshToken } = payload
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        return payload
      })
  }
})

export const signoutLogic = createLogic({
  type: SIGNOUT,
  latest: true,

  process({ action, webClient }) {
    const headers = { 'Content-Type': 'application/json' }
    webClient.post('api/signout', {}, headers).subscribe()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
})

export const autoSignoutLogic = createLogic({
  type: new RegExp('[/_](REJECTED|FAILED)$'),
  latest: true,

  process({ action }, dispatch) {
    if (action.payload && action.payload.error &&
        action.payload.error.status === 401) {
      dispatch(signout())
    }
  }
})
