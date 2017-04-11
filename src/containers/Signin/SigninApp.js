// @flow
import R from 'ramda'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorMessagePath } from '../../ducks/paths'
import { signin, clearAuthError } from '../../ducks/auth'
import Signin from '../../components/Signin/Signin'

class SigninApp extends Signin {
  componentWillMount() {
    this.props.clearAuthError()
  }

  componentDidMount() {
    this.usernameField.focus()
  }

  componentWillUnmount() {
    this.props.clearAuthError()
  }
}

SigninApp.propTypes = {
  authenticating: PropTypes.bool.isRequired,
  error: PropTypes.string,
  clearAuthError: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

const mapStateToProps = (state: Object) => ({
  authenticating: state.auth.authenticating,
  error: R.path(errorMessagePath, state.auth)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit(username, password) {
    dispatch(signin(username, password))
  },

  clearAuthError() {
    dispatch(clearAuthError())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SigninApp)
