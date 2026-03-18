<template>
    <v-card v-if="control.visible" :class="styles.arrayList.root" elevation="0">
        <!-- Header -->
        <v-card-title class="array-list-title d-flex align-center py-2 px-3">
            <span :class="styles.arrayList.label">{{ cardTitle }}</span>
            <v-spacer />
            <div class="resource-list-actions">
                <button
                    class="resource-list-btn"
                    :disabled="!control.enabled || undefined"
                    @click="toggleAll"
                >
                    <v-icon size="15">{{
                        checkAll
                            ? 'mdi-checkbox-multiple-marked'
                            : 'mdi-checkbox-multiple-blank-outline'
                    }}</v-icon>
                    <span>{{ checkAll ? 'Deselect All' : 'Select All' }}</span>
                </button>
                <button
                    class="resource-list-btn"
                    :class="{ 'resource-list-btn--active': showFilter }"
                    @click="showFilter = !showFilter"
                >
                    <v-icon size="15">{{
                        showFilter ? 'mdi-filter' : 'mdi-filter-outline'
                    }}</v-icon>
                    <span>Filter</span>
                </button>
            </div>
        </v-card-title>

        <v-card-text class="pa-0 pb-1">
            <!-- Filter bar -->
            <div v-if="showFilter" class="d-flex align-center px-3 py-2">
                <v-text-field
                    label="Filter by Title"
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    variant="outlined"
                    v-model="filter"
                    hide-details
                    clearable
                    autofocus
                />
            </div>
            <v-divider v-if="showFilter" class="mb-1" />

            <!-- Item list -->
            <div
                v-for="resource in visibleResources"
                :key="resource.public_id ?? resource.id"
                class="compact-list-item"
            >
                <div
                    class="d-flex align-center px-3 compact-list-item-row"
                    :class="{ 'compact-list-item-selected': dataHasEnum(resource.public_id) }"
                    style="padding-top: 2px; padding-bottom: 2px"
                >
                    <v-checkbox
                        :model-value="dataHasEnum(resource.public_id)"
                        :id="control.id + `-input-${resource.public_id}`"
                        :path="composePaths(control.path, resource.public_id)"
                        :disabled="!control.enabled"
                        density="compact"
                        hide-details
                        class="flex-shrink-0"
                        @update:model-value="() => toggle(resource.public_id)"
                    />
                    <span class="compact-list-item-title text-body-2 flex-grow-1 ms-1">
                        {{ getTitle(resource) }}
                    </span>
                    <v-chip
                        v-if="resource.public_id"
                        variant="text"
                        class="text-info flex-shrink-0"
                        size="x-small"
                        @click.stop.prevent="copy(resource.public_id)"
                    >
                        <v-icon icon="mdi-identifier" size="14" />
                        <v-tooltip activator="parent" location="top">{{
                            resource.public_id
                        }}</v-tooltip>
                    </v-chip>
                    <v-btn
                        icon="mdi-information-outline"
                        size="x-small"
                        variant="text"
                        class="flex-shrink-0"
                        aria-label="Show details"
                        @click="openPopup(resource)"
                    />
                </div>
            </div>

            <div
                v-if="!filteredResources.length"
                class="compact-list-empty text-caption text-medium-emphasis px-3 py-2 font-italic"
            >
                {{ filter?.trim() ? 'No matches' : 'No data' }}
            </div>

            <!-- Pagination footer -->
            <div
                v-if="resources.length > 0"
                class="resource-list-footer d-flex align-center flex-wrap px-3 py-1"
            >
                <span class="text-caption text-medium-emphasis">{{ paginationInfo }}</span>
                <v-spacer />
                <span class="text-caption text-medium-emphasis me-1">Per page:</span>
                <v-select
                    v-model="pageSize"
                    :items="pageSizeOptions"
                    density="compact"
                    variant="plain"
                    hide-details
                    class="resource-list-per-page-select"
                    style="width: 46px; flex: 0 0 46px"
                    :menu-props="{ contentClass: 'resource-list-per-page-menu' }"
                    @update:model-value="currentPage = 1"
                />
                <v-pagination
                    v-if="totalPages > 1"
                    v-model="currentPage"
                    :length="totalPages"
                    density="compact"
                    size="small"
                    :total-visible="5"
                    class="ms-1"
                />
            </div>
        </v-card-text>

        <!-- Detail dialog -->
        <v-dialog
            v-model="popupVisible"
            content-class="resource-list-popup-content"
            :transition="false"
        >
            <v-card class="compact-list-popup">
                <v-card-title class="d-flex align-center text-body-1 font-weight-bold py-3 px-4">
                    <span>{{ popupData ? getTitle(popupData) : '' }}</span>
                    <v-spacer />
                    <v-btn
                        icon="mdi-close"
                        size="small"
                        variant="text"
                        class="me-n2"
                        @click="popupVisible = false"
                    />
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-0 pb-4">
                    <table v-if="popupData" class="compact-popup-table">
                        <tbody>
                            <tr v-for="prop in popupHeaders" :key="prop.value">
                                <td class="popup-prop-name text-caption text-medium-emphasis">
                                    {{ prop.title }}
                                </td>
                                <td class="popup-prop-value text-body-2">
                                    <!-- Date -->
                                    <template
                                        v-if="
                                            prop.value === 'last_update' &&
                                            getCellValue(popupData, prop.value)
                                        "
                                    >
                                        {{ formatDate(getCellValue(popupData, prop.value)) }}
                                    </template>
                                    <!-- Clickable preview -->
                                    <template
                                        v-else-if="
                                            isPreviewField(prop.value) &&
                                            getCellValue(popupData, prop.value)
                                        "
                                    >
                                        <!-- Multiple IDs -->
                                        <div
                                            v-if="
                                                Array.isArray(getCellValue(popupData, prop.value))
                                            "
                                            class="popup-multiline"
                                        >
                                            <button
                                                v-for="(id, i) in getCellValue(
                                                    popupData,
                                                    prop.value
                                                )"
                                                :key="i"
                                                class="resource-preview-btn"
                                                @click="showResourcePreview(id, prop.value)"
                                            >
                                                <v-icon size="13">mdi-eye-outline</v-icon>
                                                {{ id }}
                                            </button>
                                        </div>
                                        <!-- Single ID -->
                                        <button
                                            v-else
                                            class="resource-preview-btn"
                                            @click="
                                                showResourcePreview(
                                                    getCellValue(popupData, prop.value),
                                                    prop.value
                                                )
                                            "
                                        >
                                            <v-icon size="13">mdi-eye-outline</v-icon>
                                            {{ getCellValue(popupData, prop.value) }}
                                        </button>
                                    </template>
                                    <!-- Array values -->
                                    <template
                                        v-else-if="
                                            Array.isArray(getCellValue(popupData, prop.value))
                                        "
                                    >
                                        <div class="popup-multiline">
                                            <span
                                                v-for="(item, i) in getCellValue(
                                                    popupData,
                                                    prop.value
                                                )"
                                                :key="i"
                                                >{{ item }}</span
                                            >
                                        </div>
                                    </template>
                                    <!-- Plain text / empty -->
                                    <template v-else>
                                        <span>{{
                                            getCellValue(popupData, prop.value) ?? '—'
                                        }}</span>
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Resource preview dialog -->
        <v-dialog v-model="previewVisible" max-width="800" :transition="false">
            <modal-resource
                v-if="previewVisible"
                :cas="previewCas"
                :study_id="studyPublicId"
                :type="previewType"
                :title="previewTitle"
                :input_data="previewData"
                :edit="false"
                :permissions="['read']"
                :hide_upload="true"
                @closeModal="previewVisible = false"
            />
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import { composePaths, type ControlElement } from '@jsonforms/core'
import {
    rendererProps,
    useJsonFormsArrayControl,
    useJsonFormsMultiEnumControl,
    type RendererProps
} from '@jsonforms/vue'
import { defineComponent, defineAsyncComponent, ref, watch, onMounted, type Component } from 'vue'
import {
    VCard,
    VCardText,
    VCardTitle,
    VTooltip,
    VCheckbox,
    VDialog,
    VPagination,
    VSelect
} from 'vuetify/components'
import { useVuetifyArrayControl, useVuetifyBasicControl } from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useAnalysisStore } from '@/stores/analyses.js'
import { useRunStore } from '@/stores/runs.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { useExperimentStore } from '@/stores/experiments.js'
import { useSampleStore } from '@/stores/samples.js'

// Loaded asynchronously to avoid the circular import
const ModalResource: Component = defineAsyncComponent(
    () => import('@/components/modalResource.vue')
)
import _ from 'lodash'
import moment from 'moment'

// Word-level token replacements
const WORD_REPLACEMENTS: Record<string, string> = {
    id: 'ID',
    ids: 'IDs',
    sdafile: 'SDA File',
    molecularexperiment: 'Molecular Experiment'
}

// Fields to hide in the popup
const POPUP_HIDDEN_FIELDS = new Set(['title'])

// Fields that link to a separate resource and have previews
const PREVIEW_FIELD_CAS: Record<string, string> = {
    molecularexperiment_public_id: 'experiment',
    sample_public_id: 'sample',
    molecularexperiment_public_ids: 'experiment',
    sample_public_ids: 'sample'
}

/**
 * Convert a wildcard pattern (* = any chars, ? = any single char) to a RegExp.
 * All other regex metacharacters are escaped, so the search is safe.
 * Without any wildcards the pattern behaves as a plain substring search.
 */
function wildcardToRegex(pattern: string): RegExp | null {
    if (!pattern?.trim()) return null
    try {
        const escaped = pattern.trim().replace(/[.+^${}()|[\]\\]/g, '\\$&')
        const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.')
        return new RegExp(regexStr, 'i')
    } catch {
        return null
    }
}

const controlRenderer = defineComponent({
    name: 'resource-list-renderer',
    components: {
        VCard,
        VCardTitle,
        VCardText,
        VTooltip,
        VCheckbox,
        VDialog,
        VPagination,
        VSelect,
        ModalResource
    },
    props: { ...rendererProps<ControlElement>() },
    setup(props: RendererProps<ControlElement>) {
        const defaultTableHeaders = [
            { title: 'Last update', value: 'last_update' },
            { title: 'Created by', value: 'creator_name' }
        ]
        const filter = ref('')
        const showFilter = ref(false)
        const tableHeaders = ref<{ title: string; value: string }[]>([])
        const resources = ref<any[]>([])
        const popupVisible = ref(false)
        const popupData = ref<any | null>(null)
        const currentPage = ref(1)
        const pageSize = ref(10)
        const pageSizeOptions = [5, 10, 20]
        const previewVisible = ref(false)
        const previewTitle = ref('')
        const previewCas = ref('')
        const previewType = ref<{ name: string; label: string }>({ name: '', label: '' })
        const previewData = ref<any>(null)

        // Reset to page 1 when filter text or page size changes
        watch(filter, () => {
            currentPage.value = 1
        })
        watch(pageSize, () => {
            currentPage.value = 1
        })
        // Clear filter text and reset page when the filter bar is closed
        watch(showFilter, (visible) => {
            if (!visible) {
                filter.value = ''
                currentPage.value = 1
            }
        })

        const submissionStore = useSubmissionStore()
        const schemaStore = useSchemaStore()
        const study = submissionStore.study as Record<string, any>
        const input = ref(useVuetifyBasicControl(useJsonFormsMultiEnumControl(props)))
        const inputSchema = input.value.control.schema as Record<string, any>
        const resourceType = ref<string>(inputSchema['x-check'] as string)

        onMounted(() => {
            let resourceStore: Record<string, any> = {}
            let method = ''
            let resource_type = ''
            if (resourceType.value.match(/analys/i)) {
                resourceStore = useAnalysisStore()
                resource_type = 'analysis_type'
                method = 'getStudyAnalyses'
            } else if (resourceType.value.match(/run/i)) {
                resourceStore = useRunStore()
                resource_type = 'run_type'
                method = 'getStudyRuns'
            }
            let resourceTypes: string[] = []
            resourceStore[method]({ study_id: study.public_id })
                .then((data: any) => {
                    resources.value = data
                    _.forEach(resources.value, (e: any) => {
                        if (resourceTypes.indexOf(e[resource_type]) === -1) {
                            resourceTypes.push(e[resource_type])
                        }
                    })
                    schemaStore.getSchemas().then((schemas) => {
                        _.forEach(resourceTypes, (rT) => {
                            if (schemas[rT]?.data_schema?.required) {
                                _.forEach(schemas[rT].data_schema.required, (d: string) => {
                                    const label = d
                                        .split('_')
                                        .map((token) => {
                                            const lower = token.toLowerCase()
                                            return (
                                                WORD_REPLACEMENTS[lower] ??
                                                lower.charAt(0).toUpperCase() + lower.slice(1)
                                            )
                                        })
                                        .join(' ')
                                    const header = { value: d, title: label }
                                    if (!tableHeaders.value.find((h) => h.value === header.value)) {
                                        tableHeaders.value.push(header)
                                    }
                                })
                            }
                        })
                        for (const h of defaultTableHeaders) {
                            tableHeaders.value.push(h)
                        }
                    })
                })
                .catch((err: any) => console.error(err))
        })

        const arrayControl = useVuetifyArrayControl(useJsonFormsArrayControl(props))
        const multiEnumControl = useVuetifyBasicControl(useJsonFormsMultiEnumControl(props))
        const addItem = multiEnumControl.addItem as unknown as (path: string, value: any) => void
        const removeItem = (multiEnumControl as any).removeItem as
            | ((path: string, value: any) => void)
            | undefined

        return {
            ...arrayControl,
            resourceType,
            tableHeaders,
            resources,
            filter,
            showFilter,
            popupVisible,
            popupData,
            currentPage,
            pageSize,
            pageSizeOptions,
            studyPublicId: (study as Record<string, any>).public_id,
            previewVisible,
            previewTitle,
            previewCas,
            previewType,
            previewData,
            addItem,
            removeItem
        }
    },
    computed: {
        cardTitle(): string {
            const rt = this.resourceType as string | undefined
            if (rt) {
                const spaced = rt.replace(/([A-Z])/g, ' $1').trim()
                return spaced.charAt(0).toUpperCase() + spaced.slice(1)
            }
            return 'Resources'
        },
        filteredResources(): any[] {
            if (!this.filter?.trim()) return this.resources
            const re = wildcardToRegex(this.filter)
            if (!re) return this.resources
            return this.resources.filter((r) => {
                // Always keep already-selected items visible when filtering
                if (this.dataHasEnum(r.public_id)) return true
                return re.test(this.getTitle(r))
            })
        },
        visibleResources(): any[] {
            const start = (this.currentPage - 1) * this.pageSize
            return this.filteredResources.slice(start, start + this.pageSize)
        },
        totalPages(): number {
            return Math.ceil(this.filteredResources.length / this.pageSize)
        },
        paginationInfo(): string {
            const total = this.filteredResources.length
            if (total === 0) return '0 items'
            const start = (this.currentPage - 1) * this.pageSize + 1
            const end = Math.min(start + this.pageSize - 1, total)
            return `${start}\u2013${end} of ${total}`
        },
        checkAll(): boolean {
            if (!this.resources.length) return false
            return this.resources.every((r) => this.dataHasEnum(r.public_id))
        },
        popupHeaders(): { title: string; value: string }[] {
            return this.tableHeaders.filter((h) => !POPUP_HIDDEN_FIELDS.has(h.value))
        }
    },
    methods: {
        dataHasEnum(value: any): boolean {
            return !!(this.control as any).data?.includes(value)
        },
        toggle(value: any): void {
            if (!this.dataHasEnum(value)) {
                ;(this as any).addItem((this.control as any).path, value)
            } else {
                ;(this as any).removeItem?.((this.control as any).path, value)
            }
        },
        toggleAll(): void {
            if (this.checkAll) {
                _.forEach(this.resources, (r: any) => {
                    if (this.dataHasEnum(r.public_id)) {
                        ;(this as any).removeItem?.((this.control as any).path, r.public_id)
                    }
                })
            } else {
                _.forEach(this.resources, (r: any) => {
                    if (!this.dataHasEnum(r.public_id)) {
                        ;(this as any).addItem((this.control as any).path, r.public_id)
                    }
                })
            }
        },
        openPopup(resource: any) {
            this.popupData = resource
            this.popupVisible = true
        },
        isPreviewField(fieldName: string): boolean {
            return fieldName in PREVIEW_FIELD_CAS
        },
        async showResourcePreview(publicId: string, fieldName: string) {
            const cas = PREVIEW_FIELD_CAS[fieldName]
            if (!cas) return
            const study = useSubmissionStore().study as Record<string, any>
            if (cas === 'experiment') {
                const experimentStore = useExperimentStore()
                await experimentStore.getStudyExperiments({ study_id: study.public_id })
                const found = (experimentStore.experiments as any[]).find(
                    (e: any) => e.public_id === publicId
                )
                if (found) {
                    this.previewData = found.properties
                    this.previewType = {
                        name: found.experiment_type,
                        label: found.experiment_type
                    }
                    this.previewCas = 'experiment'
                    this.previewTitle = `View Experiment ${publicId}`
                    this.previewVisible = true
                }
            } else if (cas === 'sample') {
                const sampleStore = useSampleStore()
                await sampleStore.getStudySamples({ study_id: study.public_id })
                const found = (sampleStore.samples as any[]).find(
                    (s: any) => s.public_id === publicId
                )
                if (found) {
                    this.previewData = found.properties
                    this.previewType = {
                        name: found.sample_type,
                        label: found.sample_type
                    }
                    this.previewCas = 'sample'
                    this.previewTitle = `View Sample ${publicId}`
                    this.previewVisible = true
                }
            }
        },
        getTitle(resource: any): string {
            return (
                resource.title ?? resource.properties?.title ?? resource.public_id ?? '(no title)'
            )
        },
        getCellValue(resource: any, propName: string): any {
            if (resource[propName] !== undefined) return resource[propName]
            if (resource.properties?.[propName] !== undefined) return resource.properties[propName]
            return undefined
        },
        formatDate(value: any) {
            return moment(value).format('DD.MM.YYYY')
        },
        async copy(msg: string) {
            try {
                await navigator.clipboard.writeText(msg)
                this.$notify({ type: 'success', text: 'Public ID copied to clipboard' })
            } catch (e) {
                console.error(e)
            }
        },
        composePaths
    }
})

export default controlRenderer as Component
</script>

<style scoped>
/* Header action buttons */
.resource-list-actions {
    display: flex;
    align-items: center;
}

.resource-list-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font-size: 0.8125rem;
    font-family: inherit;
    font-weight: 500;
    letter-spacing: 0;
    white-space: nowrap;
    border-radius: 4px;
    line-height: 1;
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}

.resource-list-btn:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.resource-list-btn:disabled {
    opacity: 0.38;
    cursor: default;
    pointer-events: none;
}

.resource-list-btn--active {
    color: rgb(var(--v-theme-primary));
}

.resource-list-btn :deep(.v-icon) {
    font-size: 15px !important;
    line-height: 1 !important;
    vertical-align: middle;
}

/* List items */
.compact-list-item-row {
    transition: background-color 0.15s ease;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.5);
}

.compact-list-item-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
}

.compact-list-item-selected {
    background-color: rgba(var(--v-theme-primary), 0.06);
}

.compact-list-item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Pagination footer */
.resource-list-footer {
    border-top: 1px solid rgba(var(--v-border-color), 0.5);
}

/* Popup dialog card */
.compact-list-popup {
    max-width: min(990px, 90vw);
    /* Prevent rectangular shadow from showing outside rounded corners */
    box-shadow: none !important;
    /* Use a tighter, rounded-aware shadow via filter instead */
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.18));
}

/* Details table */
.compact-popup-table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
}

.compact-popup-table tbody tr {
    border-bottom: 1px solid rgba(var(--v-border-color), 0.4);
}

.popup-prop-name {
    padding: 7px 24px 7px 16px;
    white-space: nowrap;
    vertical-align: top;
}

.popup-prop-value {
    padding: 7px 16px 7px 0;
    vertical-align: top;
}

.popup-multiline {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.popup-multiline span {
    white-space: nowrap;
    line-height: 1.4;
}

/* Per-page select */
.resource-list-per-page-select :deep(.v-field) {
    min-height: 0 !important;
    align-items: center;
    border: 1px solid rgba(var(--v-border-color), 0.35) !important;
    border-radius: 4px !important;
}
.resource-list-per-page-select :deep(.v-field__field) {
    min-height: 0 !important;
    align-items: center;
}
.resource-list-per-page-select :deep(.v-field__append-inner) {
    padding-top: 0 !important;
    padding-inline-start: 0 !important;
    width: 14px !important;
    min-width: 14px !important;
    align-self: center;
}
.resource-list-per-page-select :deep(.v-field__append-inner .v-icon) {
    font-size: 13px !important;
}
.resource-list-per-page-select :deep(.v-field__input) {
    font-size: 0.75rem !important;
    line-height: 1.25;
    letter-spacing: 0.0333em;
    min-height: 0 !important;
    padding: 2px 0 2px 2px !important;
    align-items: center;
    justify-content: center;
}
.resource-list-per-page-select :deep(.v-select__selection-text) {
    font-size: 0.75rem !important;
    line-height: 1.25;
}

.resource-list-per-page-menu .v-list {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
}
.resource-list-per-page-menu .v-list-item {
    min-height: 0 !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.resource-list-per-page-menu .v-list-item-title {
    font-size: 0.75rem !important;
    text-align: center;
}

/* Preview button in popup table */
.resource-preview-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(var(--v-border-color), 0.4);
    background: rgba(var(--v-theme-primary), 0.04);
    cursor: pointer;
    font-size: 0.8125rem;
    font-family: inherit;
    color: inherit;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
}
.resource-preview-btn:hover {
    background: rgba(var(--v-theme-primary), 0.08);
    border-color: rgba(var(--v-theme-primary), 0.3);
}
.resource-preview-btn :deep(.v-icon) {
    font-size: 13px !important;
    opacity: 0.7;
}
</style>
