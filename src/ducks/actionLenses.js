import R from 'ramda'

export const payloadLens = R.lensProp('payload')

export const errorLens = R.compose(payloadLens, R.lensProp('error'))
export const errorMessageLens = R.compose(errorLens, R.lensProp('message'))
export const errorStatusLens = R.compose(errorLens, R.lensProp('status'))
