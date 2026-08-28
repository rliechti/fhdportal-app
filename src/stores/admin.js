import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import moment from 'moment'
import _ from 'lodash'
import { useAuthStore } from '@/stores/auth.ts'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    roles: [],
    users: [],
    requests: [],
    datasets: []
  }),
  getters: {
    // Ajoutez vos getters ici si nécessaire
  },
  actions: {
    /**
     * Fetch all users. Returns cached results if already loaded.
     * @returns {Promise<Array>} List of user objects
     */
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

    /**
     * Replace the roles of a user.
     * @param {number} userId - ID of the user to update
     * @param {Array<string>} roles - New roles to assign
     * @returns {Promise<Array>} Updated roles
     */
    setRoles(userId, roles) {
       return new Promise((resolve, reject) => {
         HTTP.put('admin/users/' + encodeURIComponent(userId) + '/roles', roles)
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

    /**
     * Fetch all dataset access requests.
     * @returns {Promise<Array>} List of request objects
     */
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

    /**
     * Update the status of a dataset access request.
     * @param {{ request_id: number, request_status: string }} params
     * @returns {Promise<Object>} Updated request object
     */
    patchRequest(params) {
      return new Promise((resolve, reject) => {
        HTTP.patch('admin/requests/' + encodeURIComponent(params.request_id), {request_status: params.request_status})
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

    /**
     * Fetch all datasets pending review.
     * @returns {Promise<Array>} List of dataset objects
     */
    getDatasets() {
      return new Promise((resolve, reject) => {
        HTTP.get('admin/datasets')
          .then((res) => {
            this.datasets = res.data
            resolve(res.data)
          })
          .catch((err) => reject(err))
        })
    },

    /**
     * Update the status of a dataset submission.
     * @param {{ study_id: number, id: number, status: number }} params
     * @returns {Promise<Object>} Updated dataset object, or empty object if not found in cache
     */
    patchDataset(params) {
      return new Promise((resolve, reject) => {
        HTTP.patch(`/submissions/${encodeURIComponent(params.study_id)}/datasets/${encodeURIComponent(params.id)}`, {status_type_id: params.status})
          .then(() => {
            const user = useAuthStore();
            const idx = _.findIndex(this.datasets, (d) => d.id === params.id)
            if (idx > -1) {
              this.datasets[idx].status_type_id = params.status
              this.datasets[idx].action_time    = moment().format('YYY-MM-DD')
              this.datasets[idx].validator_id   = user.user.id
              this.datasets[idx].validator      = user.user.username
              resolve(this.datasets[idx])

            }
            resolve({})
          })
          .catch((err) => reject(err))
      })
    },
  },
})
