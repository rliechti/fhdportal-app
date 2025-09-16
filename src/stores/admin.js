import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    roles: [],
    users: [],
  }),
  getters: {
    // Ajoutez vos getters ici si nécessaire
  },
  actions: {
    getUsers() {
      return new Promise((resolve, reject) => {
        if (this.users.length) {
          resolve(this.users)
        } else {
          HTTP.get('admin/users')
            .then((res) => {
              this.users = res.data
              resolve(res.data)
            })
            .catch((err) => reject(err))
        }
      })
    },
    setRoles(userId, roles) {
      return new Promise((resolve, reject) => {
        HTTP.put('admin/users/' + userId + '/roles', roles)
          .then((res) => {
            const idx = _.findIndex(this.users, (u) => u.id === userId)
            if (idx > -1) {
              this.users[idx].roles = res.data
            }
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
  },
})
