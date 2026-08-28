<template>
    <div class="Files">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <v-dialog v-model="modal.status" width="95%">
                    <v-card width="100%">
                        <v-card-title> File {{ modal.filename }}</v-card-title>
                        <v-card-text>
                            <DataTable
                                class="mt-5"
                                :items="modal.datasets"
                                :headers="dataset_headers"
                                :show-search="false"
                                :show-columns-menu="false"
                            >
                                <template #item.study_title="{ item }">
                                    <router-link :to="`/studies/${item.study_public_id}`">{{
                                        item.study_title
                                    }}</router-link>
                                </template>
                                <template #item.title="{ item }">
                                    <router-link :to="`/datasets/${item.public_id}`">{{
                                        item.title
                                    }}</router-link>
                                </template>
                                <template #item.creator_name="{ value }">
                                    <InitialsChip :name="value" />
                                </template>
                                <template #item.creation_date="{ value }"
                                    ><DateCell :value="value"
                                /></template>
                                <template #item.last_update="{ value }"
                                    ><DateCell :value="value"
                                /></template>
                                <template #item.released_date="{ value }"
                                    ><DateCell :value="value"
                                /></template>
                            </DataTable>
                        </v-card-text>
                        <v-card-actions>
                            <p class="text-center my-5">
                                <v-btn
                                    color="secondary"
                                    variant="outlined"
                                    class="ml-2"
                                    @click="close(true)"
                                >
                                    Close
                                </v-btn>
                            </p>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <PageTitle title="My Uploaded Files" />

                <DataTable
                    table-id="files"
                    :items="files"
                    :headers="headers"
                    :loading="loading"
                    v-model:search="search"
                    :page="page"
                    server-side
                    :items-length="itemsLength"
                    :default-items-per-page="50"
                    :filters-active="filtersActive"
                    :export-rows="exportAllFiles"
                    @search="reload"
                    @reset-filters="resetFilters"
                    @update:options="onOptions"
                >
                    <template #filters>
                        <v-select
                            v-model="status"
                            label="Status"
                            :items="statusList"
                            clearable
                            @update:model-value="handleStatusChange"
                        ></v-select>
                        <div class="d-flex align-center ga-2">
                            <v-text-field
                                v-model.number="sizeMin"
                                type="number"
                                min="0"
                                step="any"
                                label="Min Size"
                                :placeholder="sizeMinPlaceholder"
                                :error="sizeRangeInvalid"
                                clearable
                                @update:model-value="debouncedSizeChange"
                            ></v-text-field>
                            <v-text-field
                                v-model.number="sizeMax"
                                type="number"
                                min="0"
                                step="any"
                                label="Max Size"
                                :placeholder="sizeMaxPlaceholder"
                                :error="sizeRangeInvalid"
                                clearable
                                @update:model-value="debouncedSizeChange"
                            ></v-text-field>
                            <v-select
                                :model-value="sizeUnit"
                                :items="['KB', 'MB', 'GB']"
                                style="max-width: 90px"
                                @update:model-value="onSizeUnitChange"
                            ></v-select>
                        </div>
                        <v-select
                            v-model="datasetLink"
                            label="Dataset Link"
                            :items="datasetLinkOptions"
                            item-title="title"
                            item-value="value"
                            @update:model-value="handleDatasetLinkChange"
                        ></v-select>
                    </template>

                    <template #no-data>
                        <div class="pa-4 text-center">
                            <p class="text-center" v-if="nb.total == 0">
                                No files yet. Please upload it
                            </p>
                            <p class="text-center" v-else>No files matching these filters</p>
                        </div>
                    </template>

                    <template #item.public_id="{ item }">
                        <CopyIdCell :value="item.public_id" notify-label="Public File ID" />
                    </template>
                    <template #item.title="{ item }">
                        <TruncatedText :text="item.title" />
                    </template>
                    <template #item.status="{ item }">
                        <StatusChip :status="item.status" match-by="id" :comment="item.comment" />
                    </template>

                    <template #item.filesize="{ value }"> {{ formatFileSize(value) }} </template>

                    <template #item.datasets="{ item }">
                        <v-btn
                            size="small"
                            variant="outlined"
                            @click="showResource(item, 'Dataset')"
                            v-if="item.datasets.length"
                        >
                            <v-icon class="mr-1" icon="mdi-eye-outline" />
                            {{ item.datasets.length }}
                        </v-btn>
                    </template>
                    <template #item.studies="{ value }">
                        <CountChip :items="value" />
                    </template>

                    <template #item.creation_date="{ value }"><DateCell :value="value" /></template>
                    <template #item.verif_date="{ value }"><DateCell :value="value" /></template>
                    <template #item.published_date="{ value }"
                        ><DateCell :value="value"
                    /></template>
                </DataTable>

                <p class="d-flex align-center text-medium-emphasis mt-4" style="font-size: 14px">
                    <v-icon icon="mdi-information-outline" size="18" class="mr-1"></v-icon>
                    All files are C4GH-encrypted.
                </p>
            </v-container>
        </v-sheet>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import _ from 'lodash'
import HTTP from '@/services/api'
import { useFileStore } from '@/stores/files.js'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useServerTable } from '@/composables/useServerTable'
import { flexColumn, fitColumn, dateColumn, numericColumn } from '@/utils/dataTableHeaders'
import { formatFileSize } from '@/utils/format'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import TruncatedText from '@/components/shared/TruncatedText.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import CountChip from '@/components/shared/datatable/cells/CountChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import InitialsChip from '@/components/shared/datatable/cells/InitialsChip.vue'

defineOptions({ name: 'Files' })

const fileStore = useFileStore()
const submissionStore = useSubmissionStore()

const files = computed(() => fileStore.files)

const modal = reactive({ status: false, filename: null, title: null, datasets: [] })

const search = ref('')
const status = ref(null)
const statusList = ref([])
const sizeMin = ref(null)
const sizeMax = ref(null)
const sizeUnit = ref('MB')
const sizeBounds = ref({ min: null, max: null })
const datasetLink = ref('all')
const datasetLinkOptions = [
    { title: 'All', value: 'all' },
    { title: 'Linked', value: 'linked' },
    { title: 'Unlinked', value: 'unlinked' }
]
const nb = ref({ total: 0, filtered: 0 })

const dataset_headers = [
    fitColumn({ title: 'Study', value: 'study_title' }),
    flexColumn({ title: 'Dataset', value: 'title' }),
    fitColumn({ title: 'Created By', value: 'creator_name' }),
    {
        title: 'Date',
        align: 'center',
        children: [
            dateColumn({ title: 'Creation', value: 'creation_date' }),
            dateColumn({ title: 'Update', value: 'last_update' }),
            dateColumn({ title: 'Release', value: 'released_date' })
        ]
    }
]

const headers = [
    fitColumn({
        title: 'ID',
        value: 'public_id',
        align: 'center',
        headerProps: { class: 'fega-table-cell-compact' },
        cellProps: { class: 'fega-table-cell-compact' },
        hideable: false
    }),
    flexColumn({ title: 'Name', value: 'title', hideable: false }),
    fitColumn({ title: 'Status', value: 'status' }),
    dateColumn({ title: 'Creation Date', value: 'creation_date' }),
    dateColumn({ title: 'Verification Date', value: 'verif_date' }),
    dateColumn({ title: 'Publication Date', value: 'published_date' }),
    numericColumn({ title: 'Size', value: 'filesize' }),
    fitColumn({ title: 'Datasets', value: 'datasets', align: 'center', sortable: false })
]

const sizeRangeInvalid = computed(
    () =>
        sizeMin.value !== null &&
        sizeMin.value !== '' &&
        sizeMax.value !== null &&
        sizeMax.value !== '' &&
        Number(sizeMin.value) > Number(sizeMax.value)
)

const filtersActive = computed(
    () =>
        !!status.value ||
        (sizeMin.value !== null && sizeMin.value !== '') ||
        (sizeMax.value !== null && sizeMax.value !== '') ||
        datasetLink.value !== 'all'
)

function sizeUnitFactor(unit) {
    return { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 }[unit] || 1
}

const sizeMinPlaceholder = computed(() => {
    if (sizeBounds.value.min == null) return undefined
    return String(Math.round((sizeBounds.value.min / sizeUnitFactor(sizeUnit.value)) * 100) / 100)
})
const sizeMaxPlaceholder = computed(() => {
    if (sizeBounds.value.max == null) return undefined
    return String(Math.round((sizeBounds.value.max / sizeUnitFactor(sizeUnit.value)) * 100) / 100)
})

function sizeToBytes(value) {
    if (value === null || value === '' || value === undefined) return null
    const num = Number(value)
    return isNaN(num) ? null : Math.round(num * sizeUnitFactor(sizeUnit.value))
}

const { page, loading, itemsLength, reload, onOptions, setItemsLength, getParams } = useServerTable(
    {
        itemsPerPage: 50,
        guard: () => !sizeRangeInvalid.value,
        fetcher: (params) => fileStore.getFiles(params),
        buildParams: ({ page: currentPage, itemsPerPage, sort }) => ({
            page: { current: currentPage, by: itemsPerPage },
            search: search.value,
            status: status.value,
            size: { min: sizeToBytes(sizeMin.value), max: sizeToBytes(sizeMax.value) },
            sort,
            datasetLink: datasetLink.value
        }),
        onSuccess: (result) => {
            nb.value = { total: result.params.total, filtered: result.params.filtered }
            statusList.value = result.params.status_list
            sizeBounds.value = result.params.size_bounds || { min: null, max: null }
            setItemsLength(result.params.filtered)
        }
    }
)

// The table is server-paginated, so `files` only ever holds the current
// page — re-request everything matching the live filters/sort in one page
// for "Export table to CSV". Goes straight through HTTP (not fileStore),
// so it doesn't clobber the paginated `files` the table is showing.
async function exportAllFiles() {
    const params = {
        ...getParams(),
        page: { current: 1, by: nb.value.filtered || itemsLength.value || 1 }
    }
    const res = await HTTP.post('/files', params)
    return res.data.data
}

function handleStatusChange() {
    reload()
}

function handleSizeChange() {
    if (sizeRangeInvalid.value) return
    reload()
}
const debouncedSizeChange = _.debounce(handleSizeChange, 350)

function handleDatasetLinkChange() {
    reload()
}

function onSizeUnitChange(newUnit) {
    const factorFrom = sizeUnitFactor(sizeUnit.value)
    const factorTo = sizeUnitFactor(newUnit)
    const convert = (value) => Math.round(value * factorFrom) / factorTo
    if (sizeMin.value !== null && sizeMin.value !== '') sizeMin.value = convert(sizeMin.value)
    if (sizeMax.value !== null && sizeMax.value !== '') sizeMax.value = convert(sizeMax.value)
    sizeUnit.value = newUnit
    handleSizeChange()
}

function resetFilters() {
    status.value = null
    sizeMin.value = null
    sizeMax.value = null
    sizeUnit.value = 'MB'
    datasetLink.value = 'all'
    reload()
}

function close() {
    modal.status = false
}

function showResource(obj) {
    modal.status = true
    modal.filename = obj.name
    modal.title = 'View Datasets'
    modal.datasets = obj.datasets
}

onMounted(() => {
    submissionStore.getStatusTypes()
})
</script>
