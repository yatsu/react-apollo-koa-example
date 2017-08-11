// @flow
import createDebug from 'debug'
import jwtDecode from 'jwt-decode'
import R from 'ramda'
import { browserHistory } from 'react-router'
import { createAction, createReducer } from 'redux-act'
import { createLogic } from 'redux-logic'
import { errorObject } from '../utils'
import type { ErrorType } from '../types'

const debugAuth = createDebug('example:auth')
// Actions

export const signin = createAction('SIGNIN')
export const signinSucceeded = createAction('SIGNIN_SUCCEEDED')
export const signinFailed = createAction('SIGNIN_FAILED')
export const signinResume = createAction('SIGNIN_RESUME')
export const signout = createAction('SIGNOUT')
export const signoutSucceeded = createAction('SIGNOUT_SUCCEEDED')
export const signoutFailed = createAction('SIGNOUT_FAILED')
export const authErrorClear = createAction('AUTH_ERROR_CLEAR')
export const githubSignin = createAction('GITHUB_SIGNIN')
export const authCallback = createAction('AUTH_CALLBACK')

// Types

type AuthState = {
  username: ?string,
  admin: boolean,
  authenticating: boolean,
  error: ?ErrorType
}

// Reducer

const initialState: AuthState = {
  username: null,
  admin: false,
  authenticating: false,
  error: null
}

export const authReducer = createReducer(
  {
    [signin]: (state: AuthState): AuthState =>
      R.merge(state, {
        authenticating: true,
        error: null
      }),

    [signinSucceeded]: (state: AuthState, payload: { accessToken: string }): AuthState => {
      const { user } = jwtDecode(payload.accessToken)
      return R.merge(state, {
        authenticated: false,
        username: user.username,
        admin: user.admin
      })
    },

    [signinFailed]: (state: AuthState, payload: ErrorType): AuthState =>
      R.merge(state, {
        authenticating: false,
        error: errorObject(payload)
      }),

    [signinResume]: (state: AuthState): AuthState => {
      const accessToken = localStorage.getItem('accessToken')
      const { user } = jwtDecode(accessToken)
      return R.merge(state, {
        authenticating: false,
        username: user.username,
        admin: user.admin
      })
    },

    [signout]: (state: AuthState): AuthState =>
      R.merge(state, {
        authenticating: false,
        username: null,
        admin: false
      }),

    [signoutSucceeded]: (state: AuthState): AuthState => state,

    [signoutFailed]: (state: AuthState): AuthState => state,

    [authErrorClear]: (state: AuthState): AuthState =>
      R.merge(state, {
        error: null
      }),

    [githubSignin]: (state: AuthState): AuthState =>
      R.merge(state, {
        authenticating: true,
        error: null
      }),

    [authCallback]: (state: AuthState): AuthState =>
      R.merge(state, {
        authenticating: true,
        error: null
      })
  },
  initialState
)

// Logic

export const signinLogic = createLogic({
  type: signin,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: signinSucceeded,
    failType: signinFailed
  },

  process({ action, webClient, wsClient }) {
    const { username, password } = action.payload
    const body = { username, password }
    const headers = { 'Content-Type': 'application/json' }
    return webClient.post('/auth/signin', body, headers, false).map((result) => {
      const { accessToken, refreshToken } = result.response
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      debugAuth('wsClient.status', wsClient.status)
      wsClient.connectionParams.authToken = accessToken
      if (wsClient.status === WebSocket.CONNECTING) {
        wsClient.connectionParams.reconnect = true
      } else {
        wsClient.close()
      }
      return result.response
    })
  }
})

export const signoutLogic = createLogic({
  type: signout,
  latest: true,

  process({ webClient, wsClient }) {
    const headers = { 'Content-Type': 'application/json' }
    webClient.post('/auth/signout', {}, headers).subscribe()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    wsClient.unsubscribeAll()
    wsClient.connectionParams.authToken = null
    wsClient.close()
  }
})

export const autoSignoutLogic = createLogic({
  type: new RegExp('_FAILED$'),
  latest: true,

  process({ action }, dispatch: Dispatch, done: () => void) {
    if (
      action.payload.status === 401 ||
      R.path(['graphQLErrors', 0, 'message'], action.payload) === 'Access denied.'
    ) {
      dispatch(signout())
    }
    done()
  }
})

export const githubSigninLogic = createLogic({
  type: githubSignin,
  latest: true,

  process({ action, webClient }, dispatch: Dispatch, done: () => void) {
    const headers = { 'Content-Type': 'application/json' }
    return webClient
      .post(`/auth/github/${action.payload.redirect || ''}`, {}, headers, false)
      .subscribe((result: Object) => {
        const { url } = result.response
        window.location = url
        done()
      })
  }
})

export const authCallbackLogic = createLogic({
  type: authCallback,
  latest: true,

  process({ action, webClient, wsClient }, dispatch: Dispatch, done: () => void) {
    const { service, code, redirect } = action.payload
    const headers = { 'Content-Type': 'application/json' }
    const body = { code }
    return webClient.post(`/auth/cb/${service}`, body, headers, false).subscribe(
      (result: Object) => {
        const { accessToken, refreshToken } = result.response
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        debugAuth('wsClient.status', wsClient.status)
        wsClient.connectionParams.authToken = accessToken
        if (wsClient.status === WebSocket.CONNECTING) {
          wsClient.connectionParams.reconnect = true
        } else {
          wsClient.close()
        }
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
