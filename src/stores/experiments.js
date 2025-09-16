import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useExperimentStore = defineStore('experiments', {
  state: () => ({
    experiments: {},

    schemas: {},
  }),
  getters: {
    // testArray(state) {
    // 	return _.values(state.test)
    //     },
  },
  actions: {
    getExperiments() {
      return new Promise((resolve, reject) => {
        HTTP.get('/experiments')
          .then((res) => {
            this.experiments = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudyExperiments(params) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + params.study_id + '/experiments')
          .then((res) => {
            this.experiments = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    deleteExperiments(params) {
      let promises = []
      _.forEach(params, (p) => {
        const promise = new Promise((resolve, reject) => {
          HTTP.delete(`/submissions/${p.study_id}/experiments/${p.experiment_id}`)
            .then((res) => {
              const deletedExperimentId = res.data
              let idx = _.findIndex(this.experiments, function (exp) {
                return exp.id == deletedExperimentId
              })
              if (idx > -1) {
                this.experiments.splice(idx, 1)
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

    editExperiment(params) {
      const method = params.experiment.properties.public_id ? 'put' : 'post'
      const putPath = params.experiment.properties.public_id
        ? '/' + params.experiment.properties.public_id
        : ''
      return new Promise((resolve, reject) => {
        HTTP[method](
          `/submissions/${params.study_id}/experiments${putPath}`,
          params.experiment,
        )
          .then((res) => {
            if (method == 'post') {
              this.experiments.push(res.data)
              resolve(res.data)
            } else {
              if (this.experiments) {
                let idx = _.findIndex(
                  this.experiments,
                  (s) => s.id === res.data.id,
                )
                if (idx > -1) {
                  this.experiments[idx] = res.data
                } else {
                  this.experiments.push(res.data)
                }
              }
              resolve(res.data)
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    uploadExperiments(studyId, formData) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/${studyId}/upload-experiments`, formData, {
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
