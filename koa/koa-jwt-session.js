// @flow
import uuid from 'uuid'
import jwt from 'jsonwebtoken'
import createDebug from 'debug'

const debugSessions = createDebug('sessions')

export interface IStore {
  get(key: string): any,
  set(key: string, data: any): any,
  destroy(key: string): null
}

export class MemStore implements IStore {
  constructor() {
    this.store = {}
  }

  async get(key) {
    return this.store[key]
  }

  async set(key, data) {
    this.store[key] = data
    return data
  }

  async destroy(key) {
    delete this.store[key]
  }
}

class JWTSessions {
  constructor() {
    this.sessions = {}
  }

  start(store: IStore, id: string) {
    this.sessions[id] = store
    return id
  }

  getStore(id: string) {
    return this.sessions[id]
  }

  end(id: string) {
    delete this.sessions[id]
  }
}

export function session(Store: IStore, opts: object) {
  const sessions = new JWTSessions()
  return async (ctx, next) => {
    const token = ctx.request.get('X-SESSION-TOKEN')
    if (!token) {
      const jwtid = uuid.v4()
      const jwtOpts = { jwtid }
      Object.keys(opts.jwt).forEach((key) => {
        switch (key) {
          case 'expiresIn':
            jwtOpts.exp = Math.floor(Date.now() / 1000) + opts.jwt[key]
            break
          case 'notBefore':
            jwtOpts.nbf = Math.floor(Date.now() / 1000) + opts.jwt[key]
            break
          case 'audience':
            jwtOpts.aud = opts.jwt[key]
            break
          case 'issuer':
            jwtOpts.iss = opts.jwt[key]
            break
          case 'subject':
            jwtOpts.sub = opts.jwt[key]
            break
          default:
            break
        }
      })
      debugSessions(jwtOpts)
      const newToken = jwt.sign(jwtOpts, opts.jwt.secretOrPublicKey)
      sessions.start(new Store(), jwtid)
      ctx.session = {
        getStore: () => sessions.getStore(jwtid),
        jwtid,
        end: () => sessions.end(jwtid)
      }
      ctx.set('X-SESSION-TOKEN', newToken)
      await next()
    } else {
      const payload = jwt.verify(token, opts.jwt.secretOrPublicKey, opts.jwt)
      ctx.session = {
        getStore: () => sessions.getStore(payload.jwtid),
        user: () => sessions.getStore(payload.jwtid).get(payload.jwtid),
        end: () => sessions.end(payload.jwtid)
      }
      await next()
    }
  }
}
