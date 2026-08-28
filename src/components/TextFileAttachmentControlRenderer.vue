<template>
    <div class="text-file-attachment-control pa-2">
        <v-textarea
            :id="control.id + '-text'"
            :label="textLabel"
            placeholder=""
            :model-value="localText"
            :disabled="!control.enabled"
            variant="outlined"
            rows="5"
            :hint="control.description"
            @update:model-value="onTextChange"
        />
    </div>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { defineComponent, ref, watch } from 'vue'
import { VTextarea } from 'vuetify/components'
import { useVuetifyControl } from '@jsonforms/vue-vuetify'

const controlRenderer = defineComponent({
    name: 'text-file-attachment-control-renderer',
    components: { VTextarea },
    props: { ...rendererProps<ControlElement>() },
    setup(props: RendererProps<ControlElement>) {
        const input = useVuetifyControl(useJsonFormsControl(props))
        const data = input.control.value.data as Record<string, any> | undefined

        const localText = ref<string>((data?.text as string) ?? '')

        watch(
            () => input.control.value.data,
            (newData: Record<string, any> | undefined) => {
                if ((newData?.text ?? '') !== localText.value) {
                    localText.value = (newData?.text as string) ?? ''
                }
            },
            { deep: true }
        )

        return {
            ...input,
            localText
        }
    },
    computed: {
        textLabel(): string {
            const schema = this.control.schema as any
            return schema?.title ?? 'Notes (Markdown)'
        }
    },
    methods: {
        onTextChange(value: string) {
            this.localText = value
            const current = (this.control.data as Record<string, any>) ?? {}
            this.handleChange(this.control.path, { ...current, text: value })

            const iri = (current.iri as string) ?? ''
            const addAttachment = (this.control as any).config?.addAttachment as
                | ((entry: { data: string; iri: string; mimeType: string }) => void)
                | undefined
            if (typeof addAttachment === 'function') {
                addAttachment({ data: value, iri, mimeType: 'text/markdown' })
            }
        }
    }
})

export default controlRenderer
export { controlRenderer as TextFileAttachmentControlRenderer }
</script>
