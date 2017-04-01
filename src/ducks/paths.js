// @flow
import R from 'ramda'

export const mapStatePathsToProps = R.curry((map: {
  [name: string]: Array<string>
}, state: Object) => R.map((path: string) => R.path(path, state), map))

export const errorPath = ['error']
export const errorMessagePath = ['error', 'message']
export const errorStatusPath = ['error', 'status']
