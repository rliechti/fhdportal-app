import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import authService from '@/services/auth'
import { useRequestStore } from '@/stores/requests.js'
interface User {
  sub: string
  id: string
  email: string
  username: string
  token: string
  refreshToken: string
  sshPublicKeys: string[]
  c4ghPublicKeys: string[]
  roles: string[],
  dtpas: string[]
}

export const useAuthStore = defineStore({
  id: 'authStore',
  persist: {
    storage: sessionStorage,  // Session only
    paths: [
      'user.sub',
      'user.id',
      'user.email',
      'user.username',
      'user.sshPublicKeys',
      'user.c4ghPublicKeys',
      'user.dtpas'
    ]
  },
  
  state: () => {
    return {
      authenticated: false as boolean,
      user: {
        sub: '',
        id: '',
        email: '',
        username: '',
        token: '',
        refreshToken: '',
        sshPublicKeys: [] as string[],
        c4ghPublicKeys: [] as string[],
        roles: [] as string[],
        dtpas: [] as string[]
      } as User,
      test: false as boolean,
    }
  },
  getters: {},
  actions: {
    async initOAuth(keycloak: any, clearData = true) {
         if (clearData) {
           await this.clearUserData()
         }
         this.authenticated = keycloak.authenticated
         if (keycloak.authenticated) {
           this.user.username = keycloak.idTokenParsed.name
           this.user.sub = keycloak.idTokenParsed.sub
           this.user.sshPublicKeys = keycloak.idTokenParsed['ssh-public-key'] || []
           this.user.c4ghPublicKeys = keycloak.idTokenParsed['c4gh-public-key'] || []
           this.user.id = keycloak.idTokenParsed.preferred_username
           this.user.email = keycloak.idTokenParsed.email
           // Replace, never append: the freshly parsed token is the single source of
           // truth for role membership, so revocations take effect on the next refresh.
           this.user.roles = keycloak.tokenParsed.realm_access?.roles ?? []
           this.user.token = keycloak.token
           this.user.refreshToken = keycloak.refreshToken
         }
       },
    async login() {
      try {
        await this.clearUserData()
        await authService.login()
      } catch (error) {
        console.error(error)
      }
    },
    async logout() {
      try {
        await this.clearUserData()
        useRequestStore().$reset()
        await authService.logout(import.meta.env.VITE_APP_URL)
      } catch (error) {
        console.error(error)
      }
    },
    async refreshToken(clearData = false, force = false) {
      try {
        const keycloak = await authService.refreshToken(force)
        await this.initOAuth(keycloak, clearData)
      } catch (error) {
        console.error(error)
      }
    },
    async clearUserData() {
      this.authenticated = false
      this.user = {
        sub: '',
        id: '',
        email: '',
        username: '',
        token: '',
        refreshToken: '',
        sshPublicKeys: [],
        c4ghPublicKeys: [],
        roles: [],
        dtpas: [],
      }
    },
    async deleteKey(params) {
       if (this.user[params.type+"PublicKeys"]?.includes(params.userKey)) {
         return new Promise((resolve, reject) => {
           const userKey = params.userKey.replace("-----BEGIN CRYPT4GH PUBLIC KEY-----","").replace("-----END CRYPT4GH PUBLIC KEY-----","").trim()
           const seedIdx = userKey.indexOf('/')
           const seed = seedIdx === -1 ? userKey : userKey.substring(0, seedIdx)
           HTTP.delete(`/users/${encodeURIComponent(this.user.sub)}/public-key/${encodeURIComponent(params.type)}/${encodeURIComponent(seed)}`)
             .then(() => {
               this.refreshToken(true, true).then(() => {
                 const idx = this.user[params.type+"PublicKeys"].indexOf(params.userKey)
                 if (idx > -1) {
                   this.user[params.type+"PublicKeys"].splice(idx, 1)
                 }

                 resolve(true)                 
               })
             })
             .catch(reject)
         })
       }
     },
     async registerKey(params) {
       if (!this.user[params.type+"PublicKeys"]?.includes(params.userKey)) {
         return new Promise((resolve, reject) => {
           HTTP.post(`/users/${encodeURIComponent(this.user.sub)}/public-key`, {
             params
           })
             .then(() => {
               this.refreshToken(true, true).then(() => {
                // this.user[params.type+"PublicKeys"] = this.user[params.type+"PublicKeys"] || []
                // this.user[params.type+"PublicKeys"].push(params.userKey)
                 
                resolve(true)                 
               })
             })
             .catch(err => reject(err.message))
         })
       }
     },
     async getUserDTPA () {
      return new Promise((resolve, reject) => {
        HTTP.get('/users/dtpa').then(res => {
          this.user.dtpas = res.data
          resolve(res.data)
        }).catch(err => reject(err))        
      })
    },

  },
})