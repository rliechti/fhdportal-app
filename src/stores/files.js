import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useFileStore = defineStore('files', {
  state: () => ({
    files: [],
    file: {},
    schemas: {},
  }),
  getters: {},
  actions: {

    // getFiles(params) {
    //   return new Promise((resolve, reject) => {
    //       console.info(params);
    //   let suffix = '?page=' + JSON.stringify(params.page);
    //   if (params.search) suffix += '&search='+params.search
    //   if (params.status) suffix += '&status='+params.status
    //
    //     HTTP.get('/files'+suffix)
    //       .then((res) => {
    //         this.files = res.data.data
    //         resolve(res.data)
    //       })
    //       .catch((err) => {
    //         reject(err)
    //       })
    //   })
    // },
    getFiles(params) {
      return new Promise((resolve, reject) => {
      // let suffix = '?page=' + JSON.stringify(params.page);
      // if (params.search) suffix += '&search='+params.search
      // if (params.status) suffix += '&status='+params.status

        HTTP.post('/files',params)
          .then((res) => {
            this.files = res.data.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getFile(fileId) {
      return new Promise((resolve, reject) => {
        this.dataset = {}
        HTTP.get(`/files/${fileId}`)
          .then((res) => {
            this.file = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getDatasetsFiles(params) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/datasets/${params.dataset_id}/files`)
          .then((res) => {
            this.files = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

  },
})
