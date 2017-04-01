// @flow
import Rx from 'rxjs'
import createDebug from 'debug'

class WebClient {
  ajax: (...rest: Array<any>) => Rx.Observable;
  debugAuth: (...rest: Array<any>) => void;

  constructor() {
    this.ajax = Rx.Observable.ajax
    this.debugAuth = createDebug('example:auth')
  }

  request(
    method: (...rest: Array<void>) => Rx.Observable,
    args: Array<any>,
    auth: ?boolean,
    retried: ?boolean
  ) {
    return Rx.Observable.create((observer) => {
      const headers = args[args.length - 1] || {}
      const authEnabled = auth === undefined || auth
      if (authEnabled) {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }
      const options: Array<any> = [...args.slice(0, args.length - 1), headers]

      const req = method(...options)
      req.subscribe(
        (result) => {
          observer.next(result.response)
        },
        (error) => {
          if (error.status === 401 && authEnabled && !retried) {
            this.tokenRefresh().subscribe(
              () => {
                this.debugAuth('token refreshed')
                this.request(method, args, auth, true).subscribe(
                  (response) => {
                    observer.next(response)
                  },
                  (retryError) => {
                    observer.error(retryError)
                  },
                  () => observer.complete()
                )
              },
              (refreshError) => {
                observer.error(refreshError)
              }
            )
          } else {
            observer.error(error)
          }
        },
        () => {
          observer.complete()
        }
      )
    })
  }

  tokenRefresh() {
    this.debugAuth('refreshing token')
    return Rx.Observable.create((observer) => {
      const refreshToken = localStorage.getItem('refreshToken') || ''
      const body = new FormData()
      body.set('refresh_token', refreshToken)
      this.post('/refresh_token', body, null, false).subscribe(
        (response) => {
          localStorage.setItem('accessToken', response.accessToken)
          observer.next(response)
        },
        (error) => {
          this.debugAuth('refreshing token failed', error.xhr.response.error.message)
          observer.error(error)
        },
        () => {
          observer.complete()
        }
      )
    })
  }

  get(url: string, headers: ?Object, auth: ?boolean) {
    return this.request(this.ajax.get, [url, headers], auth)
  }

  post(url: string, body: ?Object, headers: ?Object, auth: ?boolean) {
    return this.request(this.ajax.post, [url, body, headers], auth)
  }

  delete(url: string, headers: ?Object, auth: ?boolean) {
    return this.request(this.ajax.delete, [url, headers], auth)
  }

  put(url: string, body: ?Object, headers: ?Object, auth: ?boolean) {
    return this.request(this.ajax.put, [url, body, headers], auth)
  }

  ajax(...args: Array<any>) {
    return this.ajax(...args)
  }
}

export default WebClient
