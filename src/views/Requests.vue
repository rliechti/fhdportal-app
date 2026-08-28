<template>
    <div class="Requests">
        <v-dialog v-model="modal.status" width="80%">
            <div class="github-markdown-body">
                <modal-download
                    :download="modal.request"
                    @closeModal="closeModal"
                    @refreshToken="refreshToken"
                />
            </div>
        </v-dialog>

        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="My Dataset Downloads" />

                <DataTable
                    table-id="requests"
                    :items="visibleRequests"
                    :headers="visibleHeaders"
                    v-model:search="search"
                    :loading="loading"
                    :default-items-per-page="50"
                    :filters-active="hideExpired"
                    @reset-filters="hideExpired = false"
                >
                    <template #filters>
                        <v-switch v-model="hideExpired" label="Hide expired downloads" />
                    </template>

                    <template #item.requester="{ item }">
                        {{ item.requester }}<br />
                        {{ item.institution }}
                    </template>

                    <template #item.request_status="{ item }">
                        {{ item.request_status }}
                        <v-chip v-if="item.doa_bucket_name">
                            Download available until
                            {{ formatDate(item.doa_object_expiration) }}
                        </v-chip>
                    </template>

                    <template #item.action_time="{ value }">
                        <DateCell :value="value" />
                    </template>
                    <template #item.c4gh_public_key="{ item }">
                        <TruncatedText v-if="item.c4gh_public_key" :text="item.c4gh_public_key" />
                    </template>

                    <template #item.actions="{ item }">
                        <template
                            v-if="
                                item.request_status === 'approved' &&
                                item.doa_object_expiration &&
                                isNotExpired(item.doa_object_expiration)
                            "
                        >
                            <v-btn color="info" density="compact" @click="showDownload(item)">
                                download...
                            </v-btn>
                        </template>
                        <template
                            v-else-if="item.request_status === 'approved' && item.error_message"
                        >
                            <v-tooltip :text="item.error_message" location="bottom">
                                <template #activator="{ props }">
                                    <v-chip
                                        v-bind="props"
                                        color="error"
                                        variant="tonal"
                                        prepend-icon="mdi-alert-circle"
                                        density="compact"
                                    >
                                        {{ item.error_type }}
                                    </v-chip>
                                </template>
                            </v-tooltip>
                        </template>
                    </template>
                </DataTable>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import HTTP from '@/services/api'
import { notifyError } from '@/utils/notify'
import { useRequestStore } from '@/stores/requests.js'
import { useAuthStore } from '@/stores/auth.ts'
import { mapState } from 'pinia'
import ModalDownload from '@/components/modalDownload.vue'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import DateCell from '@/components/shared/datatable/cells/DateCell.vue'
import TruncatedText from '@/components/shared/TruncatedText.vue'
import { dateColumn, flexColumn } from '@/utils/dataTableHeaders'
import moment from 'moment'
import _ from 'lodash'
import '@/assets/styles/github.css'

export default {
    name: 'Requests',

    components: {
        ModalDownload,
        PageTitle,
        DataTable,
        DateCell,
        TruncatedText
    },

    data() {
        return {
            search: '',
            loading: true,
            hideExpired: false,

            confirmAction: {
                id: null,
                request_status: ''
            },

            headers: [
                { title: 'Study', value: 'study', width: '1%', hideable: false },
                { title: 'Dataset', value: 'dataset', hideable: false },
                flexColumn({ title: 'C4GH Public Key', value: 'c4gh_public_key' }),
                { title: 'Status', value: 'request_status', width: '1%' },
                dateColumn({ title: 'Date', value: 'action_time' }),
                { title: 'Actions', value: 'actions', width: '1%', hideable: false }
            ],

            modal: {
                status: false,
                request: {}
            }
        }
    },

    computed: {
        ...mapState(useAuthStore, ['user']),
        ...mapState(useRequestStore, ['requests']),

        visibleRequests() {
            if (this.hideExpired) {
                return _.filter(
                    this.requests,
                    (r) => !r.doa_object_expiration || this.isNotExpired(r.doa_object_expiration)
                )
            }
            return this.requests
        },

        hasVisibleActions() {
            return this.visibleRequests.some((item) => {
                if (item.request_status !== 'approved') return false
                if (item.doa_object_expiration && this.isNotExpired(item.doa_object_expiration))
                    return true
                return !!item.error_message
            })
        },

        visibleHeaders() {
            return this.hasVisibleActions
                ? this.headers
                : this.headers.filter((h) => h.value !== 'actions')
        }
    },

    methods: {
        getRequests() {
            const requestStore = useRequestStore()
            this.loading = true

            requestStore
                .getRequests()
                .then(() => {
                    this.loading = false
                })
                .catch(() => {
                    this.loading = false
                })
        },

        formatDate(value) {
            return moment(value).format('DD.MM.YYYY')
        },

        isNotExpired(inputStr) {
            return moment(inputStr).isAfter()
        },

        showDownload(request) {
            this.modal.request = request

            if (
                !request.doa_sts_token_expiration ||
                this.isNotExpired(request.doa_sts_token_expiration)
            ) {
                this.refreshToken()
                this.modal.status = true
            } else {
                this.modal.status = true
            }
        },

        closeModal() {
            this.modal.status = false
            this.modal.request = {}
        },

        refreshToken() {
            const requestStore = useRequestStore()

            if (this.modal.request.request_id !== undefined && this.modal.request.request_id) {
                requestStore
                    .getRequestTokens(this.modal.request.request_id)
                    .then((properties) => {
                        _.forEach(properties, (v, k) => {
                            const key = `doa_${k}`
                            if (this.modal.request[key] !== undefined) {
                                this.modal.request[key] = v
                            }
                        })
                        this.getRequests()
                    })
                    .catch(() => {
                        notifyError('Failed to refresh request tokens. Please try again.')
                    })
            }
        }
    },

    mounted() {
        this.getRequests()
    }
}
</script>
