<template>
    <div class="binary-file-attachment-control">
        <!-- Previously uploaded files (items with id) -->
        <div v-for="item in previousFiles" :key="item.id" class="attachment-row">
            <v-icon class="attachment-row-icon" size="18">mdi-file-document-outline</v-icon>
            <div class="attachment-row-name">
                <a
                    v-if="safeDownloadUrl(item.meta?.downloadUrl)"
                    :href="safeDownloadUrl(item.meta?.downloadUrl)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-decoration-none"
                    >{{ item.meta?.fileName }}</a
                >
                <span v-else>{{ item.meta?.fileName }}</span>
            </div>
            <v-btn
                icon
                size="x-small"
                variant="text"
                :disabled="!control.enabled"
                @click="removePreviousFile(item)"
            >
                <v-icon size="16">mdi-close</v-icon>
            </v-btn>
        </div>

        <div
            v-for="(slot, idx) in newFileSlots"
            :key="slot._key"
            class="attachment-row attachment-row--new"
        >
            <v-icon class="attachment-row-icon" size="18">mdi-paperclip</v-icon>
            <div class="attachment-row-name">{{ slot.filename }}</div>
            <v-btn
                icon
                size="x-small"
                variant="text"
                :disabled="!control.enabled"
                @click="removeNewSlot(idx)"
            >
                <v-icon size="16">mdi-close</v-icon>
            </v-btn>
        </div>

        <div v-if="uploadError" class="attachment-error text-error text-caption">
            {{ uploadError }}
        </div>

        <input ref="fileInput" type="file" style="display: none" @change="onFileChange" />

        <v-btn
            prepend-icon="mdi-plus"
            variant="text"
            size="small"
            :disabled="!control.enabled"
            @click="triggerFileSelect"
        >
            Add Attachment
        </v-btn>
    </div>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { defineComponent, ref } from 'vue'
import { useVuetifyControl } from '@jsonforms/vue-vuetify'

interface AttachmentMeta {
    fileName?: string
    iri?: string
    mimeType?: string
    downloadUrl?: string
    size?: number
    creationDate?: string
}

interface AttachmentItem {
    id?: string
    meta?: AttachmentMeta
}

interface NewSlot {
    _key: string
    iri: string
    filename: string
}

const controlRenderer = defineComponent({
    name: 'binary-file-attachment-control-renderer',
    props: { ...rendererProps<ControlElement>() },
    setup(props: RendererProps<ControlElement>) {
        const input = useVuetifyControl(useJsonFormsControl(props))
        const newFileSlots = ref<NewSlot[]>([])
        const uploadError = ref('')
        return { ...input, newFileSlots, uploadError }
    },
    computed: {
        defaultIri(): string {
            const data = this.control.data as any
            if (data?.iri) return data.iri as string
            const schema = this.control.schema as any
            return schema?.['x-iri'] ?? ''
        },
        previousFiles(): AttachmentItem[] {
            const data = this.control.data
            if (!Array.isArray(data)) return []
            return data.filter((item) => !!item.id)
        }
    },
    methods: {
        // downloadUrl is server-supplied metadata Vue's :href binding does not
        // scheme-check on its own — javascript: is a legal attribute value, so an
        // unvalidated URL here is a stored-XSS sink (security audit H-1). Resolve
        // relative URLs against the current origin so real download links keep
        // working, and reject anything whose scheme isn't explicitly allowed.
        safeDownloadUrl(raw?: string): string | null {
            if (!raw) return null
            // Reject protocol-relative URLs explicitly - new URL() would otherwise
            // silently resolve "//evil.example/x" to an attacker-chosen host under
            // whatever scheme this origin happens to use.
            if (raw.trim().startsWith('//')) return null
            const SAFE_SCHEMES = ['http:', 'https:']
            let parsed: URL
            try {
                parsed = new URL(raw, window.location.origin)
            } catch {
                return null
            }
            return SAFE_SCHEMES.includes(parsed.protocol) ? parsed.href : null
        },
        triggerFileSelect() {
            this.uploadError = ''
            ;(this.$refs.fileInput as HTMLInputElement).click()
        },
        removeNewSlot(idx: number) {
            const slot = this.newFileSlots[idx]
            const removeAttachmentFile = (this.control as any).config?.removeAttachmentFile as
                | ((fileName: string) => void)
                | undefined
            if (typeof removeAttachmentFile === 'function') {
                removeAttachmentFile(slot.filename)
            }
            this.newFileSlots.splice(idx, 1)
        },
        removePreviousFile(item: AttachmentItem) {
            const data = Array.isArray(this.control.data)
                ? [...(this.control.data as AttachmentItem[])]
                : []
            const idx = data.findIndex((d) => d.id === item.id)
            if (idx >= 0) {
                data.splice(idx, 1)
                this.handleChange(this.control.path, data)
            }
        },
        async onFileChange(event: Event) {
            const input = event.target as HTMLInputElement
            const file = input.files?.[0]
            // Reset so the same file can be re-selected next time
            input.value = ''
            if (!file) return

            if (file.size > 20 * 1024 * 1024) {
                this.uploadError = 'File is too large. Maximum size is 20 MB.'
                return
            }

            this.uploadError = ''

            try {
                const arrayBuffer = await file.arrayBuffer()
                const uint8 = new Uint8Array(arrayBuffer)
                let binary = ''
                for (let i = 0; i < uint8.length; i++) {
                    binary += String.fromCharCode(uint8[i])
                }
                const base64 = btoa(binary)

                const addAttachmentFile = (this.control as any).config?.addAttachmentFile as
                    | ((entry: {
                          iri: string
                          fileName: string
                          mimeType: string
                          fileContent: string
                      }) => void)
                    | undefined

                if (typeof addAttachmentFile === 'function') {
                    addAttachmentFile({
                        iri: this.defaultIri,
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        fileContent: base64
                    })
                }

                this.newFileSlots.push({
                    _key: Math.random().toString(36).slice(2),
                    iri: this.defaultIri,
                    filename: file.name
                })
            } catch {
                this.uploadError = 'Failed to process file. Please try again.'
            }
        }
    }
})

export default controlRenderer
export { controlRenderer as BinaryFileAttachmentControlRenderer }
</script>

<style scoped>
.binary-file-attachment-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0 0;
}

.attachment-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 12px;
    min-height: 44px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.02);
}

.attachment-row--new {
    background-color: #ffffff;
}

.attachment-row-icon {
    flex-shrink: 0;
    opacity: 0.55;
}

.attachment-row-name {
    flex: 1;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.attachment-error {
    padding: 0 4px;
}
</style>
