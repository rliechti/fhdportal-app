import { defineStore } from 'pinia'
import HTTP from '@/services/api'

export const useDacStore = defineStore('dacs', {
  state: () => ({
    dacs: {},
    schemas: {},
  }),
  getters: {},
  actions: {
    getDacs() {
      return new Promise((resolve, reject) => {
        if (this.dacs.length) {
          resolve(this.dacs)
        } else {
          HTTP.get('/dacs')
            .then((res) => {
              this.dacs = res.data
              resolve(res.data)
            })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },
    submitRequest (params){
      return new Promise((resolve,reject) => {
        console.log(params)
        resolve(params)
      })
    },
    getRequestForm(dataset_id){
      return new Promise ((resolve, reject) => {
      HTTP.get(`/dacs/${dataset_id}/request-form`)
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
          reject(err)
        })
      })
    },
    getPolicyForm(dataset_id, policy_id, form){
      return new Promise((resolve, reject) => {
        HTTP.get(`/dacs/${dataset_id}/policies/${policy_id}/${form}`).then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err)
        })
      })
    }
  },
})
