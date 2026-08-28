<template>
    <div class="Studies">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="Studies" />

                <DataTable
                    table-id="studies"
                    :loading="loading"
                    :items="studies"
                    :headers="tableHeaders"
                    v-model:search="search"
                >
                    <template #item.public_id="{ value }">
                        <v-btn
                            variant="text"
                            color="info"
                            class="fega-table-btn"
                            @click="viewStudy(value)"
                            >{{ value }}</v-btn
                        >
                    </template>
                    <template #item.released_date="{ value }">
                        <DateCell :value="value" />
                    </template>
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useStudyStore } from '@/stores/studies.js'
import { mapState } from 'pinia'
import { notifyError } from '@/utils/notify'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import { dateColumn, numericColumn, idColumn } from '@/utils/dataTableHeaders'

export default defineComponent({
    name: 'Studies',
    components: {
        PageTitle,
        DataTable,
        DateCell
    },
    data() {
        return {
            loading: false,
            search: '',
            tableHeaders: [
                idColumn({
                    title: 'ID',
                    value: 'public_id',
                    sortable: true,
                    hideable: false
                }),
                {
                    title: 'Title',
                    value: 'title',
                    sortable: true,
                    hideable: false
                },
                {
                    title: 'Type',
                    value: 'study_type',
                    sortable: true
                },
                numericColumn({
                    title: 'Datasets',
                    value: 'nb_datasets',
                    sortable: true
                }),
                dateColumn({
                    title: 'Publication Date',
                    value: 'released_date',
                    sortable: true
                })
            ]
        }
    },
    computed: {
        ...mapState(useStudyStore, ['studies'])
    },
    methods: {
        viewStudy(studyPublicId) {
            this.$router.push(`/studies/${studyPublicId}`)
        }
    },
    mounted() {
        this.loading = true
        let store = useStudyStore()
        store.resetStudies().then(() => {
            store
                .getStudies()
                .then(() => {
                    this.loading = false
                })
                .catch(() => {
                    notifyError('Failed to load studies. Please try again.')
                    this.loading = false
                })
        })
    }
})
</script>

<style></style>
