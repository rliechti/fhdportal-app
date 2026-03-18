import { defineStore } from 'pinia'
import HTTP from '@/services/api'

export const useSchemaStore = defineStore('schema', {
    state: () => ({
        schemas: {},
        documentation: {}
    }),
    getters: {},
    actions: {
        _patchMultiTypeDefaults(schema) {
            if (!schema || typeof schema !== 'object') return
            if (schema.properties) {
                for (const prop of Object.values(schema.properties)) {
                    if (Array.isArray(prop.type) && !('default' in prop)) {
                        prop.default = ''
                    } else {
                        this._patchMultiTypeDefaults(prop)
                    }
                }
            }
            if (schema.items) this._patchMultiTypeDefaults(schema.items)
        },
        getSchemas() {
            return new Promise((resolve, reject) => {
                if (Object.keys(this.schemas).length) {
                    resolve(this.schemas)
                } else {
                    HTTP.get('/schemas')
                        .then((res) => {
                            this.schemas = res.data
                            for (const resourceSchema of Object.values(this.schemas)) {
                                if (resourceSchema.data_schema) {
                                    this._patchMultiTypeDefaults(resourceSchema.data_schema)
                                }
                            }
                            resolve(this.schemas)
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
        }
    }
})
