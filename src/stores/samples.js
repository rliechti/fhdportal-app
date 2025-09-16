import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useSampleStore = defineStore('samples', {
  state: () => ({
    // samples: [],
    samples: {},
    schemas: {},
  }),
  getters: {
    // testArray(state) {
    // 	return _.values(state.test)
    //     },
  },
  actions: {
    cleanSamples() {
      this.samples = {}
    },
    getSamples() {
      return new Promise((resolve, reject) => {
        HTTP.get('/samples')
          .then((res) => {
            this.samples = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudySamples(params) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + params.study_id + '/samples')
          .then((res) => {
            this.samples = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    deleteSamples(params) {
      let promises = []
      _.forEach(params, (p) => {
        const promise = new Promise((resolve, reject) => {
          HTTP.delete(`/submissions/${p.study_id}/samples/${p.sample_id}`)
            .then((res) => {
              const deletedSampleId = res.data
              let idx = _.findIndex(this.samples, function (sa) {
                return sa.id == deletedSampleId
              })
              if (idx > -1) {
                this.samples.splice(idx, 1)
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
    editSample(params) {
      return new Promise((resolve, reject) => {
        const method = params.sample.properties.public_id ? 'put' : 'post'
        const putPath = params.sample.properties.public_id
          ? `/${params.sample.properties.public_id}`
          : ''
        HTTP[method](
          `/submissions/${params.study_id}/samples${putPath}`,
          params.sample,
        )
          .then((res) => {
            let s = res.data
            if (s.action_type_id == 'MOD') {
              let idx = _.findIndex(this.samples, function (sa) {
                return sa.id == s.id
              })
              if (idx > -1) {
                this.samples[idx] = s
              } else {
                this.samples.push(s)
              }
            } else {
              this.samples.push(s)
            }
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    uploadSamples(studyId, formData) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/${studyId}/upload-samples`, formData, {
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
