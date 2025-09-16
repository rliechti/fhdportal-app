import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import _ from 'lodash'

export const useSubmissionStore = defineStore('submissions', {
  state: () => ({
    studies: [],
    study: {},
    roles: null,
    statusTypes: null,
    schemas: null,
  }),
  getters: {},
  actions: {
    uploadStudy(formData) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/upload-study`, formData, {
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
    deleteStudy(study_id) {
      return new Promise((resolve, reject) => {
        HTTP.delete('/submissions/' + study_id)
          .then(() => {
            let deletedStudyId = null
            let idx = _.findIndex(this.studies, function (sa) {
              return sa.id == deletedStudyId
            })
            if (idx > -1) {
              this.studies.splice(idx, 1)
            }

            resolve(true)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    downloadTemplate(cas) {
      return new Promise((resolve, reject) => {
        HTTP.get('/' + cas + '/template', { responseType: 'arraybuffer' })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    downloadCli() {
      return new Promise((resolve, reject) => {
        HTTP.get('/cli', { responseType: 'arraybuffer' })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    downloadStudy(study_id) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + study_id + '/download', {
          responseType: 'arraybuffer',
        })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    getRoles() {
      return new Promise((resolve, reject) => {
        if (this.roles) {
          resolve(this.roles)
        } else {
          HTTP.get(`/roles`)
            .then((res) => {
              this.roles = res.data
              resolve(res.data)
            })
            .catch((err) => reject(err))
        }
      })
    },
    getStatusTypes() {
      return new Promise((resolve, reject) => {
        if (this.statusTypes) {
          resolve(this.statusTypes)
        } else {
          HTTP.get('/status-types')
            .then((res) => {
              this.statusTypes = res.data
              resolve(res.data)
            })
            .catch((err) => reject(err))
        }
      })
    },
    getUsers(params) {
      return new Promise((resolve, reject) => {
        let suffix = '',
          tmp = []
        _.forEach(params, function (v, p) {
          tmp.push(p + '=' + v)
        })
        suffix = '?' + tmp.join('&')
        HTTP.get(`/users` + suffix)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    patchStudy(study_id, patch) {
      return new Promise((resolve, reject) => {
        HTTP.patch(`/submissions/${study_id}`, patch)
          .then((res) => {
            if (this.study.id == study_id || this.study.public_id === study_id){
              _.forEach(patch,(v,k) => {
                if (this.study[k] !== undefined){
                  this.study[k] = v
                }  
              })
            }
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    addStudyUser(user) {
      return new Promise((resolve, reject) => {
        HTTP.post(`/submissions/` + user.study_id + `/users`, user)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    deleteStudyUser(user) {
      return new Promise((resolve, reject) => {
        HTTP.delete(`/submissions/` + user.study_id + `/users/` + user.user_id)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    getPubmeds(pmid) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/pubmeds/${pmid}`)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    resetStudies(){
      return new Promise((resolve) => {
        this.studies = []        
        resolve(true)
      })
    },
    getStudies(params) {
      return new Promise((resolve, reject) => {
        let suffix = ''
        if (params && _.keys(params).length) {
          suffix += '?'
          _.forEach(params, function (d, p) {
            suffix += p + '=' + d + '&'
          })
          suffix = suffix.slice(0, -1)
        }
        HTTP.get('/submissions' + suffix)
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
        if (study_id === 'new') {
          resolve({
            id: null,
            properties: {},
            access: {},
          })
        } else {
          if (this.study.id == study_id) {
            resolve(this.study)
          } else {
            HTTP.get('/submissions/' + study_id)
              .then((res) => {
                this.study = res.data
                resolve(res.data)
              })
              .catch((err) => {
                reject(err)
              })
          }
        }
      })
    },
    // postStudy(study){
    editStudy(study) {
      const method = study.id ? 'put' : 'post'
      const putPath = study.id ? `/${study.public_id}` : ''
      return new Promise((resolve, reject) => {
        HTTP[method](`/submissions${putPath}`, study)
          .then((res) => {
            if (method == 'post') {
              let keys = _.keys(this.studies)
              let max = _.max(keys)
              let idx = keys.length ? +max + 1 : 0
              this.studies[idx] = res.data
              // this.studies.push(res.data)
              resolve(res.data)
            } else {
              if (this.study) {
                this.study = res.data
                resolve(res.data)
              }
              if (this.studies) {
                let idx = _.findIndex(this.studies, (s) => s.id === res.data.id)
                if (idx > -1) {
                  this.studies[idx] = res.data
                }
                resolve(res.data)
              }
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },

    getStudyFiles(filetype) {
      if (!filetype) {
        filetype = 'raw'
      }
      if (this.study.id === undefined) {
        return
      }
      return new Promise((resolve, reject) => {
        if (filetype === 'analysis') {
          if (this.study.analysis_files !== undefined) {
            resolve(this.study.analysis_files)
          } else {
            HTTP.get(`/submissions/${this.study.public_id}/analysis-files`)
              .then((res) => {
                this.study.analysis_files = res.data
                resolve(res.data)
              })
              .catch((err) => {
                reject(err)
              })
          }
        } else {
          if (this.study.files !== undefined) {
            resolve(this.study.files)
          } else {
            HTTP.get(`/submissions/${this.study.public_id}/raw-files`)
              .then((res) => {
                this.study.files = res.data
                resolve(res.data)
              })
              .catch((err) => {
                reject(err)
              })
          }
        }
      })
    },
    getStudyAnalysisFiles() {
      return new Promise((resolve, reject) => {
        this.getStudyFiles('analysis')
          .then((data) => {
            resolve(data)
          })
          .catch((err) => reject(err))
      })
    },
  },
})
