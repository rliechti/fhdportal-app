import { defineStore } from 'pinia'
import HTTP from '@/services/api'

export const useSchemaStore = defineStore('schema', {
  state: () => ({
    schemas: {},
    documentation: {},
  }),
  getters: {},
  actions: {
    getSchemas() {
      return new Promise((resolve, reject) => {
        if (Object.keys(this.schemas).length) {
          resolve(this.schemas)
        } else {
          HTTP.get('/schemas')
            .then((res) => {
              this.schemas = res.data
              resolve(res.data)
            })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },
    getDocumentation() {
      return new Promise((resolve, reject) => {
        if (Object.keys(this.documentation).length) {
          resolve(this.documentation)
        } else {
          HTTP.get('/documentation')
            .then((res) => {
              this.documentation = res.data
              resolve(res.data)
            })
            .catch((err) => {
              reject(err)
            })
        }
      })
    },
  },
})
