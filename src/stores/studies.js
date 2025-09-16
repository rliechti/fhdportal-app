import { defineStore } from 'pinia'
import HTTP from '@/services/api'

export const useStudyStore = defineStore('studies', {
  state: () => ({
    studies: [],
    study: {},
  }),
  getters: {},
  actions: {
    getPubmeds(pmid) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/pubmeds/${pmid}`)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    resetStudies() {
      return new Promise((resolve) => {
        this.studies = []
        resolve(true)
      })
    },
    getStudies() {
      return new Promise((resolve, reject) => {
        HTTP.get('/studies')
          .then((res) => {
            this.studies = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudy(study_id) {
      return new Promise((resolve, reject) => {
          if (this.study.id == study_id) {
            resolve(this.study)
          } else {
            HTTP.get('/studies/' + study_id)
              .then((res) => {
                this.study = res.data
                resolve(res.data)
              })
              .catch((err) => {
                reject(err)
              })
          }
      })
    }
  }
})
