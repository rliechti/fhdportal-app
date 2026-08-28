import apiService from '@/services/api'

const add = (store) => {
  apiService.interceptors.request.use(
    async (config) =>  {
      if (store.authenticated) {
        await store.refreshToken()
        config.headers['Authorization'] = 'Bearer ' + store.user.token
        config.headers['x-access-token'] = 'Bearer ' + store.user.token
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
      if (import.meta.env.DEV) {
        console.log('apiService response error', error.response?.status, error.config?.url)
      }
      const config = error.config
      if (error.response?.status === 401 && !config._retry) {
        config._retry = true
        try {
          await store.refreshToken()
          config.headers['x-access-token'] = 'Bearer ' + store.user.token
          config.headers['Authorization'] = 'Bearer ' + store.user.token
          return apiService(config)
        } catch (_error) {
          if (import.meta.env.DEV) {
            console.error('Refresh token failed', _error.response?.status, _error.config?.url)
          }
          return Promise.reject(_error)
        }
      }
      return Promise.reject(error)
    },
  )
}

export default add
