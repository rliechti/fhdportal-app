import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import authService from '@/services/auth'
interface User {
  sub: string
  id: string
  username: string
  token: string
  refreshToken: string
  sshPublicKeys: string[]
  c4ghPublicKeys: string[]
  roles: string[]
}

export const useAuthStore = defineStore({
  id: 'authStore',
  state: () => {
    return {
      authenticated: false as boolean,
      user: {
        sub: '',
        id: '',
        username: '',
        token: '',
        refreshToken: '',
        sshPublicKeys: [] as string[],
        c4ghPublicKeys: [] as string[],
        roles: [] as string[],
      } as User,
      test: false as boolean,
    }
  },
  persist: true,
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
           if (keycloak.tokenParsed.realm_access?.roles !== undefined) {
             this.user.roles = this.user.roles.concat(
               keycloak.tokenParsed.realm_access.roles
             )
           }
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
      console.log('logout')
      try {
        await authService.logout(import.meta.env.VITE_APP_URL)
        await this.clearUserData()
      } catch (error) {
        console.error(error)
      }
    },
    async refreshToken() {
      try {
				console.log("auth.ts refreshToken")
        const keycloak = await authService.refreshToken()
        this.initOAuth(keycloak, false)
      } catch (error) {
        console.error(error)
      }
    },
    async clearUserData() {
      this.authenticated = false
      this.user = {
        sub: '',
        id: '',
        username: '',
        token: '',
        refreshToken: '',
        sshPublicKeys: [],
        c4ghPublicKeys: [],
        roles: [],
      }
    },
    async deleteKey(params) {
       if (this.user[params.type+"PublicKeys"]?.includes(params.userKey)) {
         return new Promise((resolve, reject) => {
           const userKey = params.userKey.replace("-----BEGIN CRYPT4GH PUBLIC KEY-----","").replace("-----END CRYPT4GH PUBLIC KEY-----","").trim()
           const seedIdx = userKey.indexOf('/')
           const seed = seedIdx === -1 ? userKey : userKey.substring(0, seedIdx - 1)
           HTTP.delete(`/users/${this.user.sub}/public-key/${params.type}/${seed}`)
             .then(() => {
               const idx = this.user[params.type+"PublicKeys"].indexOf(params.userKey)
               if (idx > -1) {
                 this.user[params.type+"PublicKeys"].splice(idx, 1)
               }
               this.refreshToken()
               resolve(true)
             })
             .catch(reject)
         })
       }
     },
     async registerKey(params) {
       if (!this.user[params.type+"PublicKeys"]?.includes(params.userKey)) {
         return new Promise((resolve, reject) => {
           HTTP.post(`/users/${this.user.sub}/public-key`, {
             params
           })
             .then(() => {
               this.user[params.type+"PublicKeys"] = this.user[params.type+"PublicKeys"] || []
               this.user[params.type+"PublicKeys"].push(params.userKey)
               this.refreshToken()
               resolve(true)
             })
             .catch(err => reject(err.message))
         })
       }
     }
  },
})