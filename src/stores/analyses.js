import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useAnalysisStore = defineStore('analyses', {
  state: () => ({
    // analyses: [],
    analyses: {},
    schemas: {},
  }),
  getters: {},
  actions: {
    getAnalyses() {
      return new Promise((resolve, reject) => {
        HTTP.get('/analyses')
          .then((res) => {
            this.analyses = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudyAnalyses(params) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + params.study_id + '/analyses')
          .then((res) => {
            this.analyses = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    deleteAnalyses(params) {
      let promises = []
      _.forEach(params, (p) => {
        const promise = new Promise((resolve, reject) => {
          HTTP.delete(`/submissions/${p.study_id}/analyses/${p.analyse_id}`)
            .then((res) => {
              const deletedAnalysisId = res.data
              let idx = _.findIndex(this.analyses, function (ana) {
                return ana.id == deletedAnalysisId
              })
              if (idx > -1) {
                this.analyses.splice(idx, 1)
              }
              resolve(res.data)
            })
            .catch((err) => {
              reject(err)
            })
        })
        promises.push(promise)
      })

      return Promise.all(promises).then((results) => {
        return results
      })
    },

    editAnalysis(params) {
      return new Promise((resolve, reject) => {
        const method = params.analysis.properties.public_id ? 'put' : 'post'
        const putPath = params.analysis.properties.public_id
          ? `/${params.analysis.properties.public_id}`
          : ''
        HTTP[method](
          `/submissions/${params.study_id}/analyses${putPath}`,
          params.analysis,
        )
          .then((res) => {
            let s = res.data
            if (s.action_type_id == 'MOD') {
              let idx = _.findIndex(this.analyses, function (sa) {
                return sa.id == s.id
              })
              if (idx > -1) {
                this.analyses[idx] = s
              } else {
                this.analyses.push(s)
              }
            } else {
              this.analyses.push(res.data)
            }
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    uploadAnalyses(studyId, formData) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/${studyId}/upload-analyses`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
  },
})
