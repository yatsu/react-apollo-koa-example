// @flow
import { connect } from 'react-redux'
import { mapStatePathsToProps } from '../ducks/paths'
import { signout, usernamePath, adminPath } from '../ducks/auth'
import Header from '../components/Header'

const mapStateToProps = (state: Object) => ({
  path: state.routing.locationBeforeTransitions.pathname,
  ...mapStatePathsToProps(
    {
      username: ['auth', ...usernamePath],
      admin: ['auth', ...adminPath]
    },
    state
  )
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signout() {
    dispatch(signout())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
