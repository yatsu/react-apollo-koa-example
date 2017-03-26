import R from 'ramda'

export const immLensProp = key => R.lens(x => x.get(key), (val, x) => x.set(key, val))

export const immLensPath = path => R.lens(x => x.getIn(path), (val, x) => x.setIn(path, val))
