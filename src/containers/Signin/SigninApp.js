// @flow
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import { mapStatePathsToProps, errorMessagePath } from '../../ducks/paths'
import { signin, clearAuthError, authenticatingPath } from '../../ducks/auth'
import Signin from '../../components/Signin/Signin'

class SigninApp extends Signin {
  static propTypes = {
    authenticating: PropTypes.bool.isRequired,
    error: PropTypes.string,
    clearAuthError: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  static defaultProps = {
    error: null
  };

  componentWillMount() {
    this.props.clearAuthError()
  }

  componentDidMount() {
    this.usernameField.focus()
  }

  componentWillUnmount() {
    this.usernameField.value = ''
    this.passwordField.value = ''
    this.props.clearAuthError()
  }
}

const mapStatusToProps = mapStatePathsToProps({
  auththenticating: ['auth', ...authenticatingPath],
  error: ['auth', ...errorMessagePath]
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit(username, password) {
    dispatch(signin(username, password))
  },

  clearAuthError() {
    dispatch(clearAuthError())
  }
})

export default connect(mapStatusToProps, mapDispatchToProps)(SigninApp)
