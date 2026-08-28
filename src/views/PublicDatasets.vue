<template>
    <div class="Studies">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="Datasets" />

                <DataTable
                    table-id="datasets"
                    :loading="loading"
                    :items="datasets"
                    :headers="tableHeaders"
                    v-model:search="search"
                >
                    <template #item.public_id="{ value }">
                        <v-btn
                            variant="text"
                            color="info"
                            class="fega-table-btn"
                            @click="viewDataset(value)"
                            >{{ value }}</v-btn
                        >
                    </template>
                    <template #item.types="{ item, value }">
                        <v-chip v-for="t in value" :key="`${item.public_id}${t}`" size="small">{{
                            t
                        }}</v-chip>
                    </template>
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useDatasetStore } from '@/stores/datasets.js'
import { mapState } from 'pinia'
import { notifyError } from '@/utils/notify'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import { numericColumn, idColumn } from '@/utils/dataTableHeaders'

export default defineComponent({
    name: 'PublicDatasets',
    components: {
        PageTitle,
        DataTable
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
                    title: 'Description',
                    value: 'description',
                    sortable: true
                },
                {
                    title: 'Technology',
                    value: 'types',
                    sortable: true
                },
                numericColumn({
                    title: 'Samples',
                    value: 'nb_samples',
                    sortable: true
                })
            ]
        }
    },
    computed: {
        ...mapState(useDatasetStore, ['datasets'])
    },
    methods: {
        viewDataset(datasetPublicId) {
            this.$router.push(`/datasets/${datasetPublicId}`)
        }
    },
    mounted() {
        this.loading = true
        let store = useDatasetStore()
        store.resetDatasets().then(() => {
            store
                .getDatasets()
                .then(() => {
                    this.loading = false
                })
                .catch(() => {
                    notifyError('Failed to load datasets. Please try again.')
                    this.loading = false
                })
        })
    }
})
</script>

<style></style>
