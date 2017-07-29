import R from 'ramda'
import { ErrorType } from './types'

export const keyLength = R.compose(R.length, R.keys)

export const errorMessage = (error: ErrorType) =>
  R.pathOr(error.message, ['xhr', 'response', 'error', 'message'], error)

export const errorObject = (error: ErrorType) => ({
  message: errorMessage(error),
  status: R.propOr(null, 'status', error)
})
