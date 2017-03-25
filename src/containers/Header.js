// @flow
import { connect } from 'react-redux'
import { signout } from '../ducks/auth'
import Header from '../components/Header'

const mapStateToProps = (state: Object) => ({
  path: state.routing.locationBeforeTransitions.pathname,
  username: state.auth.get('username'),
  admin: state.auth.get('admin')
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signout() {
    dispatch(signout())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
