import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useDatasetStore = defineStore('datasets', {
  state: () => ({
    datasets: [],
    dataset: {},
    schemas: {},
  }),
  getters: {},
  actions: {
    resetDatasets () {
      return new Promise((resolve) => {
        this.datasets = []
        this.dataset = {}
        resolve(true)
      })
    },
    getDatasets() {
      return new Promise((resolve, reject) => {
        HTTP.get('/datasets')
          .then((res) => {
            this.datasets = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getDataset(datasetId) {
      return new Promise((resolve, reject) => {
        this.dataset = {}
        HTTP.get(`/datasets/${datasetId}`)
          .then((res) => {
            this.dataset = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    getStudyDatasets(params) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/submissions/${params.study_id}/datasets`)
          .then((res) => {
            this.datasets = res.data
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    deleteDatasets(params) {
      let promises = []
      _.forEach(params, (p) => {
        const promise = new Promise((resolve, reject) => {
          HTTP.delete(`/submissions/${p.study_id}/datasets/${p.dataset_id}`)
            .then((res) => {
              const deletedDatasetId = res.data
              let idx = _.findIndex(this.datasets, function (ds) {
                return ds.id == deletedDatasetId
              })
              if (idx > -1) {
                this.datasets.splice(idx, 1)
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
    editDataset(params) {
      return new Promise((resolve, reject) => {
        const method = params.dataset.properties.public_id ? 'put' : 'post'
        const putPath = params.dataset.properties.public_id
          ? `/${params.dataset.properties.public_id}`
          : ''
        HTTP[method](
          `/submissions/${params.study_id}/datasets${putPath}`,
          params.dataset,
        )
          .then((res) => {
            let s = res.data
            if (s.action_type_id == 'MOD') {
              let idx = _.findIndex(this.datasets, function (sa) {
                return sa.id == s.id
              })
              this.datasets[idx] = s
            } else {
              let keys = _.keys(this.samples)
              let max = _.max(keys)
              let idx = keys.length ? +max + 1 : 0
              this.datasets[idx] = res.data
            }
            resolve(res.data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    setPolicy(params) {
      return new Promise((resolve, reject) => {
        const idx = _.findIndex(
          this.datasets,
          (d) => d.id === params.dataset_id,
        )
        if (idx > -1) {
          this.datasets[idx].properties.policy_id =
            params.policy_id
          const param = {
            study_id: params.study_id,
            dataset: {
              properties: this.datasets[idx].properties,
              dataset_type: 'Dataset',
            },
          }
          this.editDataset(param)
            .then((data) => {
              resolve(data)
            })
            .catch((err) => reject(err))
        }
      })
    }
  },
})
