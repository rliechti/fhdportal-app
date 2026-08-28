<template>
    <div class="markdown-control">
        <div v-if="renderedHtml" class="markdown-policy-attachment">
            <div class="markdown-policy-attachment__label text-caption text-medium-emphasis mb-1">
                {{ schemaTitle }}
            </div>
            <div class="markdown-policy-attachment__body">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="markdown-policy-attachment__content" v-html="renderedHtml" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { defineComponent, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'

const md = new MarkdownIt({ breaks: true, linkify: false }).use(MarkdownItHighlightjs)

const controlRenderer = defineComponent({
    name: 'markdown-control-renderer',
    props: { ...rendererProps<ControlElement>() },
    setup(props: RendererProps<ControlElement>) {
        const { control } = useJsonFormsControl(props)

        const renderedHtml = computed(() => {
            const value = control.value.data as string | undefined
            return value ? md.render(value) : ''
        })

        const schemaTitle = computed(() => {
            return (control.value.schema as any)?.title ?? null
        })

        return { control, renderedHtml, schemaTitle }
    }
})

export default controlRenderer
export { controlRenderer as MarkdownControlRenderer }
</script>

<style scoped>
.markdown-policy-attachment {
    border-radius: 6px;
}

.markdown-policy-attachment__label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    padding: 0 2px;
}

.markdown-policy-attachment__body {
    background-color: rgb(var(--v-theme-lightinfo, 235 243 254));
    border-radius: 6px;
    padding: 8px 12px;
}

.markdown-policy-attachment__content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: rgb(var(--v-theme-textPrimary, 42 53 71));
}

.markdown-policy-attachment__content :deep(p) {
    margin: 0 0 0.5em;
}

.markdown-policy-attachment__content :deep(p:last-child) {
    margin-bottom: 0;
}

.markdown-policy-attachment__content :deep(strong) {
    font-weight: 600;
}

.markdown-policy-attachment__content :deep(em) {
    font-style: italic;
}

.markdown-policy-attachment__content :deep(code) {
    background-color: rgba(83, 155, 255, 0.1);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.85em;
    font-family: 'Courier New', Courier, monospace;
}

.markdown-policy-attachment__content :deep(pre) {
    background-color: #1e2533;
    border-radius: 6px;
    padding: 12px 16px;
    overflow-x: auto;
    margin: 0.5em 0;
}

.markdown-policy-attachment__content :deep(pre code) {
    background: none;
    padding: 0;
    font-size: 0.85em;
    color: #e2e8f0;
}

.markdown-policy-attachment__content :deep(blockquote) {
    border-left: 3px solid rgb(var(--v-theme-info, 83 155 255));
    margin: 0.5em 0;
    padding: 4px 12px;
    color: rgba(42, 53, 71, 0.7);
    font-style: italic;
}

.markdown-policy-attachment__content :deep(ul),
.markdown-policy-attachment__content :deep(ol) {
    margin: 0.25em 0 0.5em 1.25em;
    padding: 0;
}

.markdown-policy-attachment__content :deep(li) {
    margin-bottom: 0.15em;
}

.markdown-policy-attachment__content :deep(h1),
.markdown-policy-attachment__content :deep(h2),
.markdown-policy-attachment__content :deep(h3),
.markdown-policy-attachment__content :deep(h4) {
    font-weight: 600;
    margin: 0.75em 0 0.25em;
    line-height: 1.3;
}

.markdown-policy-attachment__content :deep(a) {
    color: rgb(var(--v-theme-primary, 93 135 255));
    text-decoration: none;
}

.markdown-policy-attachment__content :deep(a:hover) {
    text-decoration: underline;
}
</style>
