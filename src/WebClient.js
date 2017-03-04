import Rx from 'rxjs'

class WebClient {
  constructor() {
    this.ajax = Rx.Observable.ajax
  }

  request(method, args, auth, retried) {
    return Rx.Observable.create(observer => {
      const headers = args[args.length - 1] || {}
      const authEnabled = auth === undefined || auth
      if (authEnabled) {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
      }
      const options = [...args.slice(0, args.length - 1), headers]

      const req = method(...options)
      req.subscribe(
        result => {
          observer.next(result.response)
        },
        error => {
          if (error.status === 401 && authEnabled && !retried) {
            this.tokenRefresh().subscribe(
              () => {
                console.info('token refreshed')
                this.request(method, args, auth, true).subscribe(
                  response => observer.next(response),
                  error => observer.error(error),
                  () => observer.complete()
                )
              },
              error => observer.error(error)
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
    console.info('refreshing token')
    return Rx.Observable.create(observer => {
      const refreshToken = localStorage.getItem('refreshToken')
      const body = new FormData()
      body.append('refresh_token', refreshToken)
      this.post('/refresh_token', body, null, false).subscribe(
        response => {
          localStorage.setItem('accessToken', response.accessToken)
          observer.next(response)
        },
        error => {
          console.error('refreshing token failed', error.xhr.response.error.message)
          observer.error(error)
        },
        () => observer.complete()
      )
    })
  }

  get(url, headers, auth) {
    return this.request(this.ajax.get, [url, headers], auth)
  }

  post(url, body, headers, auth) {
    return this.request(this.ajax.post, [url, body, headers], auth)
  }

  delete(url, headers, auth) {
    return this.request(this.ajax.delete, [url, headers], auth)
  }

  put(url, body, headers, auth) {
    return this.request(this.ajax.put, [url, body, headers], auth)
  }

  ajax() {
    return this.ajax(arguments)
  }
}

export default WebClient
