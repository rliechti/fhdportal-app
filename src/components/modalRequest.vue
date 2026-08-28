<template>
    <v-card width="100%" class="jf-form">
        <v-card-title class="d-flex align-center px-4 pt-4 pb-3">
            <span>Request Access to Dataset: {{ dataset_title }}</span>
        </v-card-title>
        <div class="modal-body">
            <div v-if="loading" class="d-flex justify-center py-6">
                <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="daaPhase" class="px-4 py-4">
                <v-alert type="success" variant="tonal" class="mb-4">
                    Your request has been submitted. Please download, sign, and re-upload the Data
                    Access Agreement (DAA) below.
                </v-alert>
                <v-card variant="outlined" class="pa-4 mb-4">
                    <div class="text-subtitle-1 font-weight-medium mb-3">
                        Step 1 — Download the DAA
                    </div>
                    <v-btn
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-download"
                        :loading="downloadingDaa"
                        @click="downloadDaa"
                    >
                        Download DAA (PDF)
                    </v-btn>
                </v-card>
                <v-card variant="outlined" class="pa-4">
                    <div class="text-subtitle-1 font-weight-medium mb-3">
                        Step 2 — Upload the signed DAA
                    </div>
                    <v-file-input
                        v-model="signedDaaFile"
                        label="Select signed DAA (PDF)"
                        accept="application/pdf"
                        prepend-icon="mdi-file-pdf-box"
                        show-size
                        class="mb-3"
                    />
                    <v-btn
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-upload"
                        :disabled="!signedDaaFile || uploadingDaa"
                        :loading="uploadingDaa"
                        @click="uploadSignedDaa"
                    >
                        Upload &amp; Submit Signed DAA
                    </v-btn>
                </v-card>
            </div>
            <template v-else>
              <user-keys type="c4gh" :show='true'></user-keys>
              <json-forms
                  :data="formData"
                  :schema="dataSchema"
                  :uischema="uiSchema"
                  :renderers="renderers"
                  :config="jsonFormsConfig"
                  @change="updateData"
              />              
            </template>
        </div>
        <v-card-actions class="px-4 pt-2 pb-4">
            <template v-if="daaPhase">
                <v-btn color="secondary" variant="outlined" @click="closeModal">Close</v-btn>
            </template>
            <template v-else>
                <v-btn
                    color="primary"
                    variant="flat"
                    :disabled="loading || submitting || !user.c4ghPublicKeys.length || !user.c4ghPublicKeys[0]"
                    :loading="submitting"
                    @click="submitRequest"
                >
                    Send Request
                </v-btn>
                <v-btn color="secondary" variant="outlined" @click="closeModal">Cancel</v-btn>
            </template>
        </v-card-actions>
    </v-card>
</template>

<script>
import { defineComponent } from 'vue'
import { useRequestStore } from '@/stores/requests.js'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers } from '@jsonforms/vue-vuetify'
import { useAuthStore } from '@/stores/auth'
import { mapState } from 'pinia'
import { notifyError } from '@/utils/notify'
import BinaryFileAttachmentControlRenderer from '@/components/BinaryFileAttachmentControlRenderer.vue'
import BinaryFileAttachmentControlTester from '@/testers/BinaryFileAttachmentControlTester.js'
import TextFileAttachmentControlRenderer from '@/components/TextFileAttachmentControlRenderer.vue'
import TextFileAttachmentControlTester from '@/testers/TextFileAttachmentControlTester.js'
import MarkdownControlRenderer from '@/components/MarkdownControlRenderer.vue'
import MarkdownControlTester from '@/testers/MarkdownControlTester.js'
import UserKeys from '@/components/UserKeys.vue'

const renderers = Object.freeze([
    { tester: MarkdownControlTester, renderer: MarkdownControlRenderer },
    { tester: BinaryFileAttachmentControlTester, renderer: BinaryFileAttachmentControlRenderer },
    { tester: TextFileAttachmentControlTester, renderer: TextFileAttachmentControlRenderer },
    ...vuetifyRenderers
])

function normalizeToSchema(data, schema) {
    if (!schema) {
        return data
    }
    if (schema.type === 'boolean') {
        return data === undefined ? false : data
    }
    if (schema.type === 'object') {
        const base =
            Array.isArray(data) || typeof data !== 'object' || data === null ? {} : { ...data }
        if (schema.properties) {
            for (const [key, subSchema] of Object.entries(schema.properties)) {
                base[key] = normalizeToSchema(base[key], subSchema)
            }
        }
        return base
    }
    return data
}

export default defineComponent({
    name: 'ModalRequest',
    props: ['dataset_id', 'dataset_title', 'policy_id', 'dac_request_id'],
    components: {
        JsonForms,
        UserKeys
    },
    data() {
        return {
            loading: false,
            submitting: false,
            dataRequestId: null,
            uiSchema: {},
            dataSchema: {},
            formData: {},
            attachments: [],
            attachmentFiles: [],
            renderers,
            daaPhase: false,
            downloadingDaa: false,
            signedDaaFile: null,
            uploadingDaa: false
        }
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        jsonFormsConfig() {
            return {
                dataRequestId: this.dataRequestId,
                addAttachment: (entry) => {
                    const idx = this.attachments.findIndex((a) => a.iri === entry.iri)
                    if (idx >= 0) {
                        this.attachments[idx] = entry
                    } else {
                        this.attachments.push(entry)
                    }
                },
                addAttachmentFile: (entry) => {
                    const idx = this.attachmentFiles.findIndex((a) => a.fileName === entry.fileName)
                    if (idx >= 0) {
                        this.attachmentFiles[idx] = entry
                    } else {
                        this.attachmentFiles.push(entry)
                    }
                },
                removeAttachmentFile: (fileName) => {
                    const idx = this.attachmentFiles.findIndex((a) => a.fileName === fileName)
                    if (idx >= 0) {
                        this.attachmentFiles.splice(idx, 1)
                    }
                }
            }
        }
    },
    methods: {
        closeModal() {
            this.$emit('closeModal')
        },
        updateData(event) {
            this.formData = event.data
        },
        async submitRequest() {
            this.submitting = true
            const requestStore = useRequestStore()
            try {
                await requestStore.saveDataRequest(this.dataRequestId, {
                    formValues: this.formData,
                    attachments: this.attachments,
                    attachmentFiles: this.attachmentFiles,
                    status: 'pending',
                    dataset_id: this.dataset_id
                })
                this.daaPhase = true
            } catch {
                notifyError('Failed to send request. Please try again.')
            } finally {
                this.submitting = false
            }
        },
        async downloadDaa() {
            this.downloadingDaa = true
            const requestStore = useRequestStore()
            try {
                const res = await requestStore.downloadDaa(this.dataRequestId)
                const blob = new Blob([res.data], {
                    type: res.headers['content-type'] || 'application/pdf'
                })
                const url = URL.createObjectURL(blob)
                const disposition = res.headers['content-disposition'] || ''
                const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
                const fileName = fileNameMatch ? fileNameMatch[1].replace(/['"]/g, '') : 'daa.pdf'
                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                a.click()
                URL.revokeObjectURL(url)
            } catch {
                notifyError('Failed to download DAA. Please try again.')
            } finally {
                this.downloadingDaa = false
            }
        },
        async uploadSignedDaa() {
            if (!this.signedDaaFile) return
            this.uploadingDaa = true
            const requestStore = useRequestStore()
            try {
                const file = Array.isArray(this.signedDaaFile)
                    ? this.signedDaaFile[0]
                    : this.signedDaaFile
                await requestStore.uploadSignedDaa(this.dataRequestId, file)
                this.$notify({ type: 'success', title: 'Signed DAA submitted successfully' })
                this.closeModal()
            } catch (err) {
                notifyError(err?.response ? 'Failed to upload signed DAA. Please try again.' : err.message)
            } finally {
                this.uploadingDaa = false
            }
        }
    },
    async mounted() {
        const requestStore = useRequestStore()

        // Resuming a partial submission
        if (this.dac_request_id) {
            this.dataRequestId = this.dac_request_id
            this.daaPhase = true
            return
        }

        this.loading = true
        try {
            const request = await requestStore.createDataRequest(this.dataset_id)
            this.dataRequestId = request.id
            const formDef = await requestStore.getRequesterForm(request.id)
            const { schema, uiSchema, initialValues } = formDef.jsonForms
            this.dataSchema = schema
            this.uiSchema = JSON.parse(
                JSON.stringify(uiSchema).replace(
                    /\/properties\/additional-info/g,
                    '/properties/upload-markdown'
                )
            )
            this.formData = normalizeToSchema(initialValues ?? {}, schema)
        } catch {
            notifyError('Failed to initialize request. Please try again.')
            this.closeModal()
        } finally {
            this.loading = false
        }
    }
})
</script>
