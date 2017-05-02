// @flow
import createDebug from 'debug'
import PropTypes from 'prop-types'
import R from 'ramda'
import { connect } from 'react-redux'
import {
  localSignin,
  socialSigninCallback,
  signinFailed,
  clearAuthError,
  setRedirectPath
} from '../../ducks/auth'
import Signin from '../../components/Signin/Signin'
import { AuthError } from '../../types'

const debugAuth = createDebug('example:auth')

class SigninApp extends Signin {
  componentWillMount() {
    const redirectPath = this.props.location.query.redirect
    if (redirectPath) {
      this.props.setRedirectPath(redirectPath)
    }
  }

  componentDidMount() {
    const { query } = this.props.location
    if (R.isEmpty(query) || query.redirect) {
      this.passwordField.value = ''
      this.usernameField.select()
    } else if (query.error) {
      debugAuth('social auth error', query.error)
      this.props.onSigninFailed({ message: 'System error', status: 500 })
    } else {
      this.props.onSocialSigninCallback(query)
    }
  }

  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.error) {
      setTimeout(
        () => {
          this.passwordField.select()
        },
        0
      )
    }
  }

  componentWillUnmount() {
    this.props.clearAuthError()
  }
}

SigninApp.propTypes = {
  authenticating: PropTypes.bool.isRequired,
  error: PropTypes.shape(AuthError),
  clearAuthError: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onSocialSigninCallback: PropTypes.func.isRequired
}

const mapStateToProps = (state: Object) => ({
  authenticating: state.auth.authenticating,
  error: state.auth.error
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLocalSubmit(username, password) {
    dispatch(localSignin(username, password))
  },
  onSocialSigninCallback(callbackArgs) {
    dispatch(socialSigninCallback(callbackArgs))
  },
  onSigninFailed(error, location) {
    dispatch(signinFailed(error, location))
  },
  clearAuthError() {
    dispatch(clearAuthError())
  },
  setRedirectPath(path) {
    dispatch(setRedirectPath(path))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SigninApp)
