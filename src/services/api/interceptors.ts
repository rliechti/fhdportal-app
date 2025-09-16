import apiService from '@/services/api'

const add = (store) => {
  apiService.interceptors.request.use(
    (config) => {
      if (store.authenticated) {
        config.headers['Authorization'] = 'Bearer ' + store.user.token
        config.headers['x-access-token'] = 'Bearer ' + store.user.token
        config.headers['X-Forwarded-Prefix'] = '/api'
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  apiService.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
			console.log('apiService response error')
			console.log(error)
      const config = error.config
      if (error.response?.status === 401 && !config._retry) {
        config._retry = true
        try {
          await store.refreshToken()
          config.headers['x-access-token'] = 'Bearer ' + store.user.token
          config.headers['Authorization'] = 'Bearer ' + store.user.token
          config.headers['X-Forwarded-Prefix'] = '/api'
          return apiService(config)
        } catch (_error) {
          console.error('Refresh token failed')
          console.error(_error)
          return Promise.reject(_error)
        }
      }
      return Promise.reject(error)
    },
  )
}

export default add
