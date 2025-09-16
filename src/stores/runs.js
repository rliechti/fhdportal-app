import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useRunStore = defineStore('runs', {
  state: () => ({
    // runs: [],
    runs: {},
    schemas: {},
  }),
  getters: {},
  actions: {
    getRuns() {
      return new Promise((resolve, reject) => {
        HTTP.get('/runs')
          .then((res) => {
            this.runs = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudyRuns(params) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + params.study_id + '/runs')
          .then((res) => {
            this.runs = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    deleteRuns(params) {
      let promises = []
      _.forEach(params, (p) => {
        const promise = new Promise((resolve, reject) => {
          HTTP.delete(`/submissions/${p.study_id}/runs/${p.run_id}`)
            .then((res) => {
              const deletedRunId = res.data
              let idx = _.findIndex(this.runs, function (sa) {
                return sa.id == deletedRunId
              })
              if (idx > -1) {
                this.runs.splice(idx, 1)
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

    editRun(params) {
      return new Promise((resolve, reject) => {
        const method = params.run.properties.public_id ? 'put' : 'post'
        const putPath = params.run.properties.public_id
          ? `/${params.run.properties.public_id}`
          : ''
        HTTP[method](`/submissions/${params.study_id}/runs${putPath}`, params.run)
          .then((res) => {
            let run = res.data
            if (run.action_type_id == 'MOD') {
              let idx = _.findIndex(this.runs, function (r) {
                return r.id == run.id
              })
              if (idx > -1) {
                this.runs[idx] = run
              } else {
                this.runs.push(run)
              }
            } else {
              this.runs.push(run)
            }
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    uploadRuns(studyId, formData) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/${studyId}/upload-runs`, formData, {
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
