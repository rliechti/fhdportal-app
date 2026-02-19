import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    roles: [],
    users: [],
    requests: []
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
    getRequests() {
      return new Promise((resolve, reject) => {
        HTTP.get('admin/requests')
          .then((res) => {
            this.requests = res.data
            resolve(res.data)
          })
          .catch((err) => reject(err))
        })
    },
    patchRequest(params) {
      return new Promise((resolve, reject) => {
        HTTP.patch('admin/requests/' + params.request_id, {request_status: params.request_status})
          .then((res) => {
            const idx = _.findIndex(this.requests, (r) => r.request_id === params.request_id)
            if (idx > -1) {
              this.requests[idx].request_id     = res.data.request_id
              this.requests[idx].request_status = res.data.request_status
              this.requests[idx].action_time    = res.data.action_time
              this.requests[idx].validator_id   = res.data.validator_id
              this.requests[idx].validator      = res.data.validator
            }
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
  },
})
