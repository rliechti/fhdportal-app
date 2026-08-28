import { defineStore } from 'pinia'
import HTTP from '@/services/api'
import moment from 'moment'
import _ from 'lodash'
import { useAuthStore } from '@/stores/auth.ts'

const MAX_DAA_BYTES = 20 * 1024 * 1024

// Basename only, conservative charset, length-capped: the server must not
// receive path separators or control characters in a filename.
function safeFileName(name) {
    return name
        .split(/[/\\]/)
        .pop()
        .replace(/[^A-Za-z0-9._-]/g, '_')
        .slice(-128)
}

async function isPdf(file) {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer())
    return String.fromCharCode(...header) === '%PDF-'
}

export const useRequestStore = defineStore('requests', {
    state: () => ({
        requests: []
    }),
    getters: {
        // Ajoutez vos getters ici si nécessaire
    },
    actions: {
        getRequests() {
            return new Promise((resolve, reject) => {
                HTTP.get('/requests')
                    .then((res) => {
                        this.requests = res.data
                        resolve(res.data)
                    })
                    .catch((err) => reject(err))
            })
        },
        getRequestTokens(requestId) {
            return new Promise((resolve, reject) => {
                HTTP.get(`/requests/${encodeURIComponent(requestId)}/tokens`)
                    .then((res) => {
                        resolve(res.data)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },
        createDataRequest(datasetId) {
            return new Promise((resolve, reject) => {
                HTTP.post('/dacs/requests', { datasetIDs: [datasetId] })
                    .then((res) => resolve(res.data))
                    .catch((err) => reject(err))
            })
        },
        async getRequesterForm(requestId) {
            const res = await HTTP.get(`/dacs/requests/${encodeURIComponent(requestId)}/form`)
            return res.data
        },
        saveDataRequest(
            requestId,
            {
                formValues,
                attachments = [],
                attachmentFiles = [],
                status = 'pending',
                dataset_id
            } = {}
        ) {
            const body = { formValues, status }
            if (dataset_id) body.dataset_id = dataset_id
            if (attachments.length) body.attachments = attachments
            if (attachmentFiles.length) body.attachmentFiles = attachmentFiles
            return new Promise((resolve, reject) => {
                HTTP.patch(`/dacs/requests/${encodeURIComponent(requestId)}`, body)
                    .then((res) => resolve(res.data))
                    .catch((err) => reject(err))
            })
        },
        downloadDaa(requestId) {
            return HTTP.get(`/dacs/requests/${encodeURIComponent(requestId)}/daa`, { responseType: 'blob' }).then(
                (res) => res
            )
        },
        async uploadSignedDaa(requestId, file) {
            if (file.size > MAX_DAA_BYTES) {
                throw new Error('File exceeds the 20 MB limit.')
            }
            if (file.type !== 'application/pdf' || !(await isPdf(file))) {
                throw new Error('The signed DAA must be a PDF document.')
            }
            const fileContent = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target.result.split(',')[1])
                reader.onerror = reject
                reader.readAsDataURL(file)
            })
            return HTTP.patch(`/dacs/requests/${encodeURIComponent(requestId)}`, {
                attachmentFiles: [
                    {
                        iri: 'https://ontology.swisscustodian.ch/schema/SignedDAA',
                        fileName: safeFileName(file.name),
                        mimeType: file.type,
                        fileContent
                    }
                ]
            }).then((res) => res.data)
        }
    }
})
