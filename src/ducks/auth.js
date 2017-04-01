// @flow
import R from 'ramda'
import { createLogic } from 'redux-logic'
import jwtDecode from 'jwt-decode'
import { errorPath, errorStatusPath } from './paths'
import type { ErrorType } from '../types'

// Actions

const SIGNIN = 'auth/SIGNIN'
const SIGNIN_SUCCEEDED = 'auth/SIGNIN_SUCCEEDED'
const SIGNIN_FAILED = 'auth/SIGNIN_FAILED'
const SIGNIN_RESUME = 'auth/SIGNIN_RESUME'
const SIGNOUT = 'auth/SIGNOUT'
const SIGNOUT_SUCCEEDED = 'auth/SIGNOUT_SUCCEEDED'
const SIGNOUT_FAILED = 'auth/SIGNOUT_FAILED'
const CLEAR_AUTH_ERROR = 'auth/CLEAR_AUTH_ERROR'

// Types

type AuthAction = {
  type: string,
  payload?: {
    username?: string,
    password?: string,
    admin?: boolean,
    error?: ErrorType
  }
}

// Types

type AuthState = {
  username: ?string,
  admin: boolean,
  authenticating: boolean,
  error: ?ErrorType
}

// Paths

export const usernamePath = ['username']
export const passwordPath = ['password']
export const adminPath = ['admin']
export const authenticatingPath = ['authenticating']

// Reducer

const initialState: AuthState = {
  username: null,
  admin: false,
  authenticating: false,
  error: null
}

export function authReducer(state: AuthState = initialState, action: Object = {}) {
  switch (action.type) {
    case SIGNIN:
      return R.pipe(R.assocPath(authenticatingPath, true), R.assocPath(errorPath, null))(state)
    case SIGNIN_SUCCEEDED:
      return R.pipe(
        R.assocPath(authenticatingPath, false),
        R.assocPath(usernamePath, R.path(usernamePath, action.payload)),
        R.assocPath(adminPath, R.path(adminPath, action.payload))
      )(state)
    case SIGNIN_FAILED:
      return R.pipe(
        R.assocPath(authenticatingPath, false),
        R.assocPath(errorPath, R.path(errorPath, action.payload))
      )(state)
    case SIGNIN_RESUME:
      return R.pipe(
        R.assocPath(authenticatingPath, false),
        R.assocPath(usernamePath, R.path(usernamePath, action.payload)),
        R.assocPath(adminPath, R.path(adminPath, action.payload))
      )(state)
    case SIGNOUT:
      return R.pipe(
        R.assocPath(authenticatingPath, false),
        R.assocPath(usernamePath, null),
        R.assocPath(adminPath, false)
      )(state)
    case SIGNOUT_SUCCEEDED:
      return state
    case SIGNOUT_FAILED:
      return state
    case CLEAR_AUTH_ERROR:
      return R.pipe(R.assocPath(authenticatingPath, false), R.assocPath(errorPath, null))(state)
    default:
      return state
  }
}

// Action Creators

export function signin(username: string, password: string): AuthAction {
  return {
    type: SIGNIN,
    payload: {
      username,
      password
    }
  }
}

export function signinSucceeded(payload: Object): AuthAction {
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

export function signinFailed(error: Object): AuthAction {
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

export function signinResume(): AuthAction {
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

export function signout(): AuthAction {
  return {
    type: SIGNOUT
  }
}

export function signoutSucceeded(): AuthAction {
  return {
    type: SIGNOUT_SUCCEEDED
  }
}

export function signoutFailed(): AuthAction {
  return {
    type: SIGNOUT_FAILED
  }
}

export function clearAuthError(): AuthAction {
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
    const { username, password } = action.payload
    const body = { username, password }
    const headers = { 'Content-Type': 'application/json' }
    return webClient.post('api/signin', body, headers, false).map((payload) => {
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

  process({ webClient }) {
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
    if (R.path(errorStatusPath, action.payload) === 401) {
      dispatch(signout())
    }
  }
})
