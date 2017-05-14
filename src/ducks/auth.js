// @flow
import jwtDecode from 'jwt-decode'
import R from 'ramda'
import { browserHistory } from 'react-router'
import { createLogic } from 'redux-logic'
import { Action, AuthError } from '../types'

// Actions

const SIGNIN = 'auth/SIGNIN'
const SIGNIN_SUCCEEDED = 'auth/SIGNIN_SUCCEEDED'
const SIGNIN_FAILED = 'auth/SIGNIN_FAILED'
const SIGNIN_RESUME = 'auth/SIGNIN_RESUME'
const SIGNOUT = 'auth/SIGNOUT'
const SIGNOUT_SUCCEEDED = 'auth/SIGNOUT_SUCCEEDED'
const SIGNOUT_FAILED = 'auth/SIGNOUT_FAILED'
const CLEAR_AUTH_ERROR = 'auth/CLEAR_AUTH_ERROR'
const GITHUB_SIGNIN = 'auth/GITHUB_SIGNIN'
const AUTH_CALLBACK = 'auth/AUTH_CALLBACK'

// Types

type AuthState = {
  username: ?string,
  admin: boolean,
  authenticating: boolean,
  error: ?AuthError
}

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
      return R.pipe(R.assoc('authenticating', true), R.assoc('error', null))(state)
    case SIGNIN_SUCCEEDED:
      return R.pipe(
        R.assoc('authenticating', false),
        R.assoc('username', R.prop('username', action.payload)),
        R.assoc('admin', R.prop('admin', action.payload))
      )(state)
    case SIGNIN_FAILED:
      return R.pipe(
        R.assoc('authenticating', false),
        R.assoc('error', R.prop('error', action.payload))
      )(state)
    case SIGNIN_RESUME:
      return R.pipe(
        R.assoc('authenticating', false),
        R.assoc('username', R.prop('username', action.payload)),
        R.assoc('admin', R.prop('admin', action.payload))
      )(state)
    case SIGNOUT:
      return R.pipe(
        R.assoc('authenticating', false),
        R.assoc('username', null),
        R.assoc('admin', false)
      )(state)
    case SIGNOUT_SUCCEEDED:
      return state
    case SIGNOUT_FAILED:
      return state
    case CLEAR_AUTH_ERROR:
      return R.pipe(R.assoc('authenticating', false), R.assoc('error', null))(state)
    case GITHUB_SIGNIN:
      return R.assoc('authenticating', true, state)
    case AUTH_CALLBACK:
      return R.pipe(R.assoc('authenticating', true), R.assoc('error', null))(state)
    default:
      return state
  }
}

// Action Creators

export function signin(username: string, password: string): Action {
  return {
    type: SIGNIN,
    payload: {
      username,
      password
    }
  }
}

export function signinSucceeded(payload: Object): Action {
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

export function signinFailed(error: AuthError): Action {
  return {
    type: SIGNIN_FAILED,
    payload: {
      error: {
        message: R.pathOr(error.message, ['xhr', 'response', 'error', 'message'], error),
        status: error.status
      }
    }
  }
}

export function signinResume(): Action {
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

export function signout(): Action {
  return {
    type: SIGNOUT
  }
}

export function signoutSucceeded(): Action {
  return {
    type: SIGNOUT_SUCCEEDED
  }
}

export function signoutFailed(): Action {
  return {
    type: SIGNOUT_FAILED
  }
}

export function clearAuthError(): Action {
  return {
    type: CLEAR_AUTH_ERROR
  }
}

export function githubSignin(redirect: ?string): Action {
  return {
    type: GITHUB_SIGNIN,
    payload: {
      redirect
    }
  }
}

export function authCallback(service: string, code: string, redirect: ?string): Action {
  return {
    type: AUTH_CALLBACK,
    payload: {
      service,
      code,
      redirect
    }
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
    return webClient.post('/auth/signin', body, headers, false).map((result) => {
      const { accessToken, refreshToken } = result.response
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      return result.response
    })
  }
})

export const signoutLogic = createLogic({
  type: SIGNOUT,
  latest: true,

  process({ webClient }) {
    const headers = { 'Content-Type': 'application/json' }
    webClient.post('/auth/signout', {}, headers).subscribe()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
})

export const autoSignoutLogic = createLogic({
  type: new RegExp('[/_](REJECTED|FAILED)$'),
  latest: true,

  process({ action }, dispatch: Dispatch, done: () => void) {
    if (
      R.path(['error', 'status'], action.payload) === 401 ||
      R.path(['error', 'graphQLErrors', 0, 'message'], action.payload) === 'Access denied.'
    ) {
      dispatch(signout())
    }
    done()
  }
})

export const githubSigninLogic = createLogic({
  type: GITHUB_SIGNIN,
  latest: true,

  process({ action, webClient }, dispatch: Dispatch, done: () => void) {
    const headers = { 'Content-Type': 'application/json' }
    const { redirect } = action.payload
    return webClient
      .post(`/auth/github/${redirect || ''}`, {}, headers, false)
      .subscribe((result: Object) => {
        const { url } = result.response
        window.location = url
        done()
      })
  }
})

export const authCallbackLogic = createLogic({
  type: AUTH_CALLBACK,
  latest: true,

  process({ action, webClient }, dispatch: Dispatch, done: () => void) {
    const { service, code, redirect } = action.payload
    const headers = { 'Content-Type': 'application/json' }
    const body = { code }
    return webClient.post(`/auth/cb/${service}`, body, headers, false).subscribe(
      (result: Object) => {
        const { accessToken, refreshToken } = result.response
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        if (redirect) {
          browserHistory.replace(redirect)
        } else {
          browserHistory.replace('')
        }
        dispatch(signinSucceeded(result.response))
        done()
      },
      (error: Object) => {
        browserHistory.replace('/signin')
        dispatch(signinFailed(error))
        done()
      }
    )
  }
})
