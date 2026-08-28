<template>
    <div class="Studies">
        <v-sheet rounded="lg">
            <v-container fluid>
                <p v-if="error" class="text-danger">{{ error }}</p>
                <p v-if="!loaded" class="text-center mt-3">
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </p>
                <div v-else>
                    <template v-if="visibleStudies.length">
                        <DataTable
                            table-id="submissions"
                            :items="visibleStudies"
                            :headers="studyTableHeaders"
                            v-model:search="search"
                            :primary-action="primaryAction"
                            @primary-action="openNewStudy"
                        >
                            <template #header.nb_samples="{}"
                                ><span>
                                    <v-tooltip activator="parent" location="bottom"
                                        >Samples
                                    </v-tooltip>
                                    <v-icon icon="mdi-water"></v-icon>
                                </span>
                            </template>
                            <template #header.nb_experiments="{}"
                                ><span>
                                    <v-tooltip activator="parent" location="bottom"
                                        >Experiments
                                    </v-tooltip>
                                    <v-icon icon="mdi-eyedropper"></v-icon>
                                </span>
                            </template>
                            <template #header.nb_runs="{}"
                                ><span>
                                    <v-tooltip activator="parent" location="bottom"
                                        >Runs
                                    </v-tooltip>
                                    <v-icon icon="mdi-run"></v-icon>
                                </span>
                            </template>
                            <template #header.nb_analyses="{}"
                                ><span>
                                    <v-tooltip activator="parent" location="bottom"
                                        >Analyses
                                    </v-tooltip>
                                    <v-icon icon="mdi-graphql"></v-icon>
                                </span>
                            </template>
                            <template #header.nb_datasets="{}"
                                ><span>
                                    <v-tooltip activator="parent" location="bottom"
                                        >Datasets
                                    </v-tooltip>
                                    <v-icon icon="mdi-file-document"></v-icon>
                                </span>
                            </template>
                            <template #item.public_id="{ item }">
                                <CopyIdCell :value="item.public_id" notify-label="Public ID" />
                            </template>
                            <template #item.title="{ item }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item)"
                                    >{{ item.title }}</v-btn
                                >
                            </template>

                            <template #item.nb_samples="{ item, value }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item, 'samples')"
                                    >{{ value }}</v-btn
                                >
                            </template>
                            <template #item.nb_experiments="{ item, value }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item, 'experiments')"
                                    >{{ value }}</v-btn
                                >
                            </template>
                            <template #item.nb_runs="{ item, value }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item, 'runs')"
                                    >{{ value }}</v-btn
                                >
                            </template>
                            <template #item.nb_analyses="{ item, value }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item, 'analyses')"
                                    >{{ value }}</v-btn
                                >
                            </template>
                            <template #item.nb_datasets="{ item, value }">
                                <v-btn
                                    variant="text"
                                    color="info"
                                    class="fega-table-btn"
                                    @click="goToStudy(item, 'datasets')"
                                    >{{ value }}</v-btn
                                >
                            </template>

                            <template #item.last_update="{ value }">
                                <DateCell :value="value" />
                            </template>
                            <template #item.actions="{ item }">
                                <p class="text-center" style="white-space: nowrap">
                                    <v-btn
                                        size="small"
                                        style="display: inline-flex; margin-bottom: 1px"
                                        color="info"
                                        variant="outlined"
                                        @click="openStudy(item)"
                                    >
                                        <v-icon class="mr-1" icon="mdi-eye"></v-icon
                                        >{{
                                            item.current_permission !== null &&
                                            item.current_permission.indexOf('edit') > -1
                                                ? 'details'
                                                : 'review'
                                        }}</v-btn
                                    >
                                    <permissions
                                        style="display: inline-flex; margin-left: 5px"
                                        :study="item"
                                        display="share"
                                    >
                                    </permissions>
                                </p>
                            </template>
                            <template #item.status="{ value }">
                                <StatusChip :status="value" />
                            </template>
                        </DataTable>
                    </template>
                </div>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { notifyError } from '@/utils/notify'
import { useAuthStore } from '@/stores/auth.ts'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useSchemaStore } from '@/stores/schemas.js'

import Permissions from '@/views/Permissions.vue'
import DataTable from '@/components/shared/DataTable.vue'
import CopyIdCell from '@/components/shared/datatable/cells/CopyIdCell.vue'
import StatusChip from '@/components/shared/datatable/cells/StatusChip.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import { numericColumn, dateColumn, idColumn } from '@/utils/dataTableHeaders'
import _ from 'lodash'
import { mapState } from 'pinia'

export default defineComponent({
    name: 'Studies',
    components: {
        Permissions,
        DataTable,
        CopyIdCell,
        StatusChip,
        DateCell
    },
    props: ['from', 'status'],
    data() {
        return {
            submissionStore: null,
            loaded: false,
            error: '',
            pmid: '',
            search: '',
            publications: [],
            studyTableHeaders: [
                idColumn({
                    title: 'ID',
                    value: 'public_id',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' },
                    hideable: false
                }),
                {
                    title: 'Title',
                    value: 'title',
                    hideable: false
                },
                numericColumn({
                    title: 'Samples',
                    value: 'nb_samples',
                    icon: 'water',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                numericColumn({
                    title: 'Experiments',
                    value: 'nb_experiments',
                    icon: 'eyedropper',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                numericColumn({
                    title: 'Runs',
                    value: 'nb_runs',
                    icon: 'run',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                numericColumn({
                    title: 'Analyses',
                    value: 'nb_analyses',
                    icon: 'graphql',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                numericColumn({
                    title: 'Datasets',
                    value: 'nb_datasets',
                    icon: 'file-document',
                    align: 'center',
                    headerProps: { class: 'fega-table-cell-compact' },
                    cellProps: { class: 'fega-table-cell-compact' }
                }),
                {
                    title: 'Status',
                    value: 'status',
                    width: '1%'
                },
                dateColumn({
                    title: 'Last Updated',
                    value: 'last_update'
                }),
                {
                    title: 'Created By',
                    value: 'creator_name',
                    width: '1%'
                },
                {
                    title: 'Actions',
                    key: 'actions',
                    sortable: false,
                    align: 'center',
                    width: '1%',
                    hideable: false
                }
            ],
            showForm: false,
            data: {
                id: null,
                title: 'Sample Study',
                study_type: 'Whole Genome Sequencing',
                description: 'this is a test'
            },
            data_schema: null,
            ui_schema: null
        }
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        ...mapState(useSubmissionStore, ['studies']),
        ...mapState(useSchemaStore, ['schemas']),
        showNewStudy() {
            return this.from === 'submission'
        },
        visibleStudies() {
            if (this.from !== 'submission') return this.studies
            return this.studies.filter((study) => study.creator_username === this.user.id)
        },
        primaryAction() {
            if (!this.showNewStudy) return null
            const hasSshKey = this.user.sshPublicKeys.length > 0
            return {
                label: 'New Submission',
                icon: 'mdi-plus',
                disabled: !hasSshKey,
                tooltip: hasSshKey ? undefined : 'Please first upload a public SSH key'
            }
        }
    },
    mounted() {
        this.submissionStore = useSubmissionStore()
        const schemaStore = useSchemaStore()
        schemaStore.getSchemas().then((schemas) => {
            if (schemas.Study !== undefined) {
                this.data_schema = schemas.Study.data_schema
                this.ui_schema = schemas.Study.ui_schema
            }
        })
        this.getStudies()
        this.getPublications = _.debounce(this.getPublications, 500)
        this.submissionStore.getStatusTypes()
    },
    methods: {
        studyLink(study, tab) {
            return tab
                ? `/submissions/${study.public_id}?${tab}=true`
                : `/submissions/${study.public_id}`
        },
        goToStudy(study, tab) {
            this.$router.push(this.studyLink(study, tab))
        },
        openNewStudy() {
            this.$router.push('/submissions/new')
        },
        openStudy(study) {
            let route = '/submissions/' + study.public_id
            this.$router.push(route)
        },
        getStudies() {
            let params = {}
            if (this.from == 'submission') {
                params = { status: 'draft,submitted,revised,published,approved,re-submitted' }
            } else if (this.from == 'list') {
                params = { status: this.status }
            }
            this.submissionStore
                .getStudies(params)
                .then(() => {
                    this.loaded = true
                })
                .catch(() => notifyError('Failed to load studies. Please try again.'))
        },
        editStudy(study) {
            this.data = JSON.parse(JSON.stringify(study.properties))
            this.data.id = study.id
            this.showForm = true
        },
        updateData(event) {
            this.data = event.data
        },
        resetForm() {
            let _this = this
            Object.keys(this.data).forEach(function (index) {
                _this.data[index] = null
            })
            this.showForm = false
        },
        submitForm() {
            this.submissionStore
                .editStudy(this.data)
                .then(() => {
                    const action = this.data.id ? 'updated' : 'registered'
                    this.$notify({
                        title: 'Study ' + action + ' successfully',
                        type: 'success'
                    })
                    this.showForm = false
                })
                .catch(() => notifyError('Failed to save the study. Please try again.'))
        },
        getPublications(search) {
            const _this = this
            if (search !== null && search.length > 4) {
                this.submissionStore
                    .getPubmeds(search)
                    .then((pubmeds) => {
                        _this.publications = Object.values(pubmeds)
                    })
                    .catch(() => notifyError('Failed to search publications. Please try again.'))
            }
        }
    }
})
</script>
