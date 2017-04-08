// @flow
import { connect } from 'react-redux'
import { signout } from '../ducks/auth'
import Header from '../components/Header'

const mapStateToProps = (state: Object) => ({
  path: state.routing.locationBeforeTransitions.pathname,
  username: state.auth.username,
  admin: state.auth.admin
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signout() {
    dispatch(signout())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
