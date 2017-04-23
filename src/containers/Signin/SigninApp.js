// @flow
import PropTypes from 'prop-types'
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

class SigninApp extends Signin {
  componentWillMount() {
    const redirectPath = this.props.location.query.redirect
    if (redirectPath) {
      this.props.setRedirectPath(redirectPath)
    }
  }

  componentDidMount() {
    const result = this.props.location.query
    if (result.error) {
      let type = 'Local'
      let message = ''
      let status = 401
      switch (result.error) {
        case 'access_denied':
          type = 'Social'
          message = 'Did you provide the right credentials?'
          break
        default:
          type = 'Social'
          message = 'Unknown Error has occured when attemting to login with a Social Account.'
          status = 501
      }
      this.props.onSigninFailed({ type, message, status })
    } else if (result.code) {
      this.props.onSocialSigninCallback(result.code)
    } else {
      this.usernameField.select()
    }
  }

  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.error) {
      setTimeout(
        () => {
          this.usernameField.select()
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
  onSocialSigninCallback(code) {
    dispatch(socialSigninCallback(code))
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
