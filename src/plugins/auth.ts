import { useAuthStore } from '@/stores/auth'
import authService from '@/services/auth'
import addInterceptors from '@/services/api/interceptors'

const plugin = {
  install(app, option) {
    const store = useAuthStore(option.pinia)
    app.config.globalProperties.$store = store

    authService.initStore(store)
    addInterceptors(store)
  },
}

export default plugin
