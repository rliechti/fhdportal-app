import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import _ from 'lodash'

export const useSubmissionStore = defineStore('submissions', {
  state: () => ({
    studies: [],
    study: {},
    roles: null,
    statusTypes: null,
    schemas: null
  }),
  getters: {},
  actions: {
    // Uses fetch() instead of the axios instance because the endpoint streams
    // newline-delimited JSON progress events while the upload is processed;
    // axios/XHR can't expose a response body incrementally in the browser.
    async uploadStudy(formData, onProgress) {
      const authStore = useAuthStore()
      if (authStore.authenticated) {
        await authStore.refreshToken()
      }

      // VITE_API_URL may or may not have a trailing slash; avoid a double slash either way
      // (axios' baseURL joining hides this, but a raw fetch URL doesn't).
      const apiUrl = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, '')
      const response = await fetch(`${apiUrl}/submissions/upload-study`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + authStore.user.token,
          'x-access-token': 'Bearer ' + authStore.user.token,
        },
        body: formData,
      })

      if (!response.body) {
        throw new Error('Upload failed: no response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let result = null

      const handleLine = (line) => {
        if (!line) return
        const event = JSON.parse(line)
        if (event.type === 'progress') {
          if (onProgress) onProgress(event)
        } else if (event.type === 'result') {
          result = event.data
        } else if (event.type === 'error') {
          throw new Error(event.message || 'Upload failed')
        }
      }

      let done = false
      while (!done) {
        const chunk = await reader.read()
        done = chunk.done
        if (done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        let newlineIndex
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)
          handleLine(line)
        }
      }
      handleLine(buffer.trim())

      if (!response.ok && result === null) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
      if (result === null) {
        throw new Error('Upload did not return a result')
      }
      return result
    },
    deleteStudy(study_id) {
      return new Promise((resolve, reject) => {
        HTTP.delete('/submissions/' + encodeURIComponent(study_id))
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
        HTTP.get('/' + encodeURIComponent(cas) + '/template', { responseType: 'arraybuffer' })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    downloadCli(binaryName) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/cli/${encodeURIComponent(binaryName)}`, { responseType: 'arraybuffer' })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    downloadStudy(study_id) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + encodeURIComponent(study_id) + '/download', {
          responseType: 'arraybuffer',
        })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => reject(err))
      })
    },
    getRoles() {
      if (this.roles) return Promise.resolve(this.roles)
      if (this._rolesPromise) return this._rolesPromise
      this._rolesPromise = HTTP.get(`/roles`)
        .then((res) => {
          this.roles = res.data
          this._rolesPromise = null
          return res.data
        })
        .catch((err) => {
          this._rolesPromise = null
          return Promise.reject(err)
        })
      return this._rolesPromise
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
        HTTP.get('/users', { params })
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    patchStudy(study_id, patch) {
      return new Promise((resolve, reject) => {
        HTTP.patch(`/submissions/${encodeURIComponent(study_id)}`, patch)
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
        HTTP.post(`/submissions/` + encodeURIComponent(user.study_id) + `/users`, user)
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    deleteStudyUser(user) {
      return new Promise((resolve, reject) => {
        HTTP.delete(`/submissions/` + encodeURIComponent(user.study_id) + `/users/` + encodeURIComponent(user.user_id))
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    getPubmeds(pmid) {
      return new Promise((resolve, reject) => {
        HTTP.get(`/pubmeds/${encodeURIComponent(pmid)}`)
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
        HTTP.get('/submissions', { params })
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
          if (this.study.public_id == study_id || this.study.id == study_id) {
            resolve(this.study)
          } else {
            HTTP.get('/submissions/' + encodeURIComponent(study_id))
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
      const putPath = study.id ? `/${encodeURIComponent(study.public_id)}` : ''
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
            HTTP.get(`/submissions/${encodeURIComponent(this.study.public_id)}/analysis-files`)
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
            HTTP.get(`/submissions/${encodeURIComponent(this.study.public_id)}/raw-files`)
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
    checkSubmission(study_id) {
      return new Promise((resolve, reject) => {
        HTTP.get('/submissions/' + encodeURIComponent(study_id) + '/check')
          .then((res) => {
            resolve(res.data)
          })
          .catch((err) => reject(err))
      })
    },
    createSubmissionVersion(){
      return new Promise((resolve,reject) => {
        HTTP.put(`/submissions/${encodeURIComponent(this.study.public_id)}/version`)
          .then(res => {
            this.study.status = "draft"
            this.study.status_type_id = 'DRA'
          })
        resolve(this.study)
      })
      
    }
  },
})
