<template>
    <div class="Keys">
        <v-sheet min-height="70vh" rounded="lg">
            <v-container fluid>
                <PageTitle title="My SSH Keys" />

                <DataTable
                    table-id="keys"
                    :items="rows"
                    :headers="headers"
                    :loading="loading"
                    v-model:search="search"
                    :primary-action="primaryAction"
                    @primary-action="openAddDialog"
                >
                    <template #item.key="{ item }">
                        <code>{{ truncate(item.key) }}</code>
                        <v-btn icon size="small" variant="text" @click="copy(item.raw)">
                            <v-icon icon="mdi-content-copy" size="18" />
                            <v-tooltip activator="parent" location="top">Copy key</v-tooltip>
                        </v-btn>
                    </template>

                    <template #item.actions="{ item }">
                        <ConfirmActionButtons
                            :actions="deleteActions"
                            :confirming="confirmDeleteKey === item.id ? 'delete' : null"
                            @arm="confirmDeleteKey = item.id"
                            @confirm="deleteKey(item)"
                            @cancel="confirmDeleteKey = null"
                        />
                    </template>

                    <template #no-data>
                        <div
                            v-if="search && sshKeys.length > 0"
                            class="pa-6 text-center text-medium-emphasis"
                        >
                            No SSH keys match your search
                        </div>
                        <div v-else class="pa-4 github-markdown-body">
                            <SshKeyContent
                                :sda_inbox_url="sda_inbox_url"
                                :sda_inbox_ip="sda_inbox_ip"
                                :sda_sftp_port="sda_sftp_port"
                                :email="user.email"
                            />
                        </div>
                    </template>
                </DataTable>

                <v-btn
                    variant="text"
                    color="info"
                    prepend-icon="mdi-help-circle"
                    class="mt-4"
                    @click="helpDialog = true"
                    >How to Generate an SSH Key?</v-btn
                >

                <v-dialog v-model="addDialog.status" width="600">
                    <v-card>
                        <v-card-title>Add a New Key</v-card-title>
                        <v-card-text>
                            <v-textarea
                                v-model="addDialog.newKey"
                                label="SSH public key (RSA or ed25519)"
                                rows="4"
                                :error-messages="
                                    addDialog.newKey && !isKeyValid
                                        ? ['Not a valid SSH public key']
                                        : []
                                "
                            ></v-textarea>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn variant="outlined" color="secondary" @click="closeAddDialog"
                                >Cancel</v-btn
                            >
                            <v-btn
                                :color="isKeyValid ? 'primary' : 'grey'"
                                variant="elevated"
                                :disabled="!isKeyValid"
                                @click="registerNewKey"
                                >Add</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-dialog v-model="helpDialog" width="1100">
                    <v-card>
                        <v-card-title>How to Generate an SSH Key?</v-card-title>
                        <v-card-text class="github-markdown-body">
                            <SshKeyContent
                                :sda_inbox_url="sda_inbox_url"
                                :sda_inbox_ip="sda_inbox_ip"
                                :sda_sftp_port="sda_sftp_port"
                                :email="user.email"
                            />
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn variant="outlined" color="secondary" @click="helpDialog = false"
                                >Close</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-container>
        </v-sheet>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
import PageTitle from '@/components/shared/PageTitle.vue'
import DataTable from '@/components/shared/DataTable.vue'
import ConfirmActionButtons from '@/components/shared/datatable/cells/ConfirmActionButtons.vue'
import SshKeyContent from '@/assets/documentation/SshKey.md'
import useClipboard from 'vue-clipboard3'
import '@/assets/styles/github.css'

export default {
    name: 'Keys',
    components: {
        PageTitle,
        DataTable,
        ConfirmActionButtons,
        SshKeyContent
    },
    data() {
        return {
            loading: false,
            confirmDeleteKey: null,
            helpDialog: false,
            addDialog: {
                status: false,
                newKey: ''
            },
            sda_inbox_url: import.meta.env.VITE_SDA_INBOX_URL,
            sda_inbox_ip: import.meta.env.VITE_SDA_INBOX_IP,
            sda_sftp_port: import.meta.env.VITE_SDA_SFTP_PORT,
            maxNbKeys: 10,
            search: '',
            headers: [
                { title: 'Type', value: 'type' },
                { title: 'Key', value: 'key', sortable: false, hideable: false },
                {
                    title: 'Actions',
                    key: 'actions',
                    sortable: false,
                    align: 'center',
                    hideable: false
                }
            ]
        }
    },
    computed: {
        ...mapState(useAuthStore, ['user']),
        sshKeys() {
            return this.user.sshPublicKeys || []
        },
        rows() {
            return this.sshKeys.map((raw) => {
                const parts = raw.split(' ')
                return {
                    id: raw,
                    raw,
                    type: parts[0] || '',
                    key: parts[1] || '',
                    comment: parts.slice(2).join(' ') || ''
                }
            })
        },
        isKeyValid() {
            const k = this.addDialog.newKey?.trim()
            if (!k) return false
            if (k.match(/ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ([^@]+@[^@]+)/)) {
                return true
            }
            return k.split(' ')[0] === 'ssh-ed25519'
        },
        primaryAction() {
            return {
                label: 'New Key',
                icon: 'mdi-plus',
                disabled: this.sshKeys.length >= this.maxNbKeys,
                tooltip:
                    this.sshKeys.length >= this.maxNbKeys
                        ? `Maximum of ${this.maxNbKeys} SSH keys reached. Delete a key to add a new one.`
                        : undefined
            }
        },
        deleteActions() {
            return [{ key: 'delete', label: 'Delete', confirmLabel: 'Confirm Deletion', icon: 'mdi-delete' }]
        }
    },
    methods: {
        truncate(key) {
            if (!key || key.length <= 33) return key
            return `${key.substring(0, 15)}[...]${key.substring(key.length - 15)}`
        },
        openAddDialog() {
            this.addDialog = { status: true, newKey: '' }
        },
        closeAddDialog() {
            this.addDialog.status = false
        },
        async copy(raw) {
            const { toClipboard } = useClipboard()
            try {
                await toClipboard(raw)
                this.$notify({
                    type: 'success',
                    text: 'The key was copied to clipboard'
                })
            } catch (e) {
                console.error(e)
            }
        },
        registerNewKey() {
            const newKey = this.addDialog.newKey.trim()
            if (this.sshKeys.includes(newKey)) {
                this.$notify({
                    title: 'Error',
                    text: 'This key is already registered',
                    type: 'danger'
                })
                return
            }
            const store = useAuthStore()
            this.loading = true
            store
                .registerKey({ type: 'ssh', userKey: newKey })
                .then(() => {
                    this.loading = false
                    this.closeAddDialog()
                    this.$notify({
                        title: 'Success',
                        text: 'Key registered successfully',
                        type: 'success'
                    })
                })
                .catch((err) => {
                    this.loading = false
                    this.$notify({ title: 'Error', text: err, type: 'danger' })
                })
        },
        deleteKey(item) {
            const store = useAuthStore()
            this.loading = true
            store
                .deleteKey({ type: 'ssh', userKey: item.raw })
                .then(() => {
                    this.loading = false
                    this.confirmDeleteKey = null
                    this.$notify({
                        title: 'Success',
                        text: 'Key deleted successfully',
                        type: 'success'
                    })
                })
                .catch((err) => {
                    this.loading = false
                    this.confirmDeleteKey = null
                    this.$notify({
                        title: 'Error',
                        text: err.message || err.response?.data || String(err),
                        type: 'danger'
                    })
                })
        }
    }
}
</script>
