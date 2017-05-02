// @flow
import R from 'ramda'
import { createLogic } from 'redux-logic'
import jwtDecode from 'jwt-decode'
import { Action, AuthError } from '../types'

// Actions

const LOCAL_SIGNIN = 'auth/LOCAL_SIGNIN'
const SOCIAL_SIGNIN_CALLBACK = 'auth/SOCIAL_SIGNIN_CALLBACK'
const SIGNIN_SUCCEEDED = 'auth/SIGNIN_SUCCEEDED'
const SIGNIN_FAILED = 'auth/SIGNIN_FAILED'
const SIGNIN_RESUME = 'auth/SIGNIN_RESUME'
const SIGNOUT = 'auth/SIGNOUT'
const SIGNOUT_SUCCEEDED = 'auth/SIGNOUT_SUCCEEDED'
const SIGNOUT_FAILED = 'auth/SIGNOUT_FAILED'
const CLEAR_AUTH_ERROR = 'auth/CLEAR_AUTH_ERROR'
const SET_REDIRECT_PATH = 'auth/SET_REDIRECT_PATH'

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
    case LOCAL_SIGNIN:
    case SOCIAL_SIGNIN_CALLBACK:
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
    case SET_REDIRECT_PATH:
      return R.pipe(R.assoc('redirectPath', R.prop('redirectPath', action.payload)))(state)
    default:
      return state
  }
}

// Action Creators

export function localSignin(username: string, password: string): Action {
  return {
    type: LOCAL_SIGNIN,
    payload: {
      username,
      password
    }
  }
}

export function socialSigninCallback(socialSigninCallbackCode: string): Action {
  return {
    type: SOCIAL_SIGNIN_CALLBACK,
    payload: {
      socialSigninCallbackCode
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
        type: error.type,
        message: error.message,
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

export function setRedirectPath(path: string): Action {
  return {
    type: SET_REDIRECT_PATH,
    payload: {
      redirectPath: path
    }
  }
}

// Logic

export const localSigninLogic = createLogic({
  type: LOCAL_SIGNIN,
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
    return webClient.post('auth/signin', body, headers, false).map((payload) => {
      const { accessToken, refreshToken } = payload
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      return payload
    })
  }
})

export const socialSigninCallbackLogic = createLogic({
  type: SOCIAL_SIGNIN_CALLBACK,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: signinSucceeded,
    failType: signinFailed
  },

  process({ action, webClient }) {
    const { socialSigninCallbackCode } = action.payload
    return webClient
      .get(`auth/social/signin/callback?code=${socialSigninCallbackCode}`, {}, false)
      .map((payload) => {
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
    webClient.post('auth/signout', {}, headers).subscribe()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('redirectTarget')
  }
})

export const autoSignoutLogic = createLogic({
  type: new RegExp('[/_](REJECTED|FAILED)$'),
  latest: true,

  process({ action }, dispatch) {
    const { error } = action.payload
    if (error && error.status === 401) {
      dispatch(signout())
    }
  }
})

export const setRedirectPathLogic = createLogic({
  type: SET_REDIRECT_PATH,
  latest: true,

  process({ action }) {
    const { redirectPath } = action.payload
    localStorage.setItem('redirectPath', redirectPath)
  }
})
