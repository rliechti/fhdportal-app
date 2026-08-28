<template>
    <div class="SubmissionInfoTab">
        <v-alert type="warning" variant="tonal" density="compact" prominent class="mb-4">
            <WarningSensitive />
        </v-alert>

        <v-alert
            v-if="!hasSshKey && !submitted"
            type="warning"
            variant="tonal"
            density="compact"
            prominent
            class="mb-4"
        >
            You do not have any SSH public key registered. An SSH key is required to authenticate
            and upload your encrypted files to the sFTP inbox. <br />
            <router-link to="/keys">Add an SSH key</router-link>
        </v-alert>

        <v-alert v-if="showQuickStart && !submitted" color="lightinfo" density="compact" class="mb-4">
            <v-btn
                variant="text"
                color="info"
                prepend-icon="mdi-information"
                @click="quickStartExpanded = !quickStartExpanded"
            >
                <span v-if="quickStartExpanded">hide</span><span v-else>show</span> quick start
                guide
            </v-btn>
            <div v-if="quickStartExpanded" class="github-markdown-body">
                <QuickStart
                    :sda_c4gh_key="sdaC4ghKey"
                    :sda_sftp_port="sdaSftpPort"
                    :email="email"
                    :sda_inbox_url="sdaInboxUrl"
                />
            </div>
        </v-alert>

        <v-alert v-if="!submitted" color="lightinfo" density="compact" class="mb-4">
            <v-btn
                variant="text"
                color="info"
                prepend-icon="mdi-information"
                @click="stepsExpanded = !stepsExpanded"
            >
                <span v-if="stepsExpanded">hide</span><span v-else>show</span> submission steps
            </v-btn>
            <div v-if="stepsExpanded" class="github-markdown-body">
                <UploadSteps :sda_inbox_url="sdaInboxUrl" :sda_inbox_ip="sdaInboxIp" />
            </div>
        </v-alert>

        <v-alert v-if="!submitted" color="lightinfo" density="compact" class="mb-4">
            <v-btn
                variant="text"
                color="info"
                prepend-icon="mdi-information"
                @click="encryptionExpanded = !encryptionExpanded"
            >
                <span v-if="encryptionExpanded">hide</span><span v-else>show</span> file encryption
                guide
            </v-btn>
            <div v-if="encryptionExpanded" class="github-markdown-body">
                <Encryption :sda_c4gh_key="sdaC4ghKey" />
            </div>
        </v-alert>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import WarningSensitive from '@/assets/documentation/WarningSensitive.md'
import UploadSteps from '@/assets/documentation/UploadSteps.md'
import Encryption from '@/assets/documentation/Encryption.md'
import QuickStart from '@/assets/documentation/QuickStart.md'
import { useLocalStorageFlag } from '@/composables/useLocalStorageFlag.js'
import '@/assets/styles/github.css'

export default defineComponent({
    name: 'SubmissionInfoTab',
    components: {
        WarningSensitive,
        UploadSteps,
        Encryption,
        QuickStart
    },
    props: {
        hasSshKey: { type: Boolean, required: true },
        defaultInfoExpanded: { type: Boolean, required: true },
        showQuickStart: { type: Boolean, required: true },
        submitted: { type: Boolean, required: true },
        sdaInboxUrl: { type: String, default: '' },
        sdaInboxIp: { type: String, default: '' },
        sdaC4ghKey: { type: String, default: '' },
        sdaSftpPort: { type: String, default: '' },
        email: { type: String, default: '' }
    },
    setup(props) {
        const stepsExpanded = useLocalStorageFlag(
            'fega.submissionInfo.stepsExpanded',
            props.defaultInfoExpanded
        )
        const encryptionExpanded = useLocalStorageFlag(
            'fega.submissionInfo.encryptionExpanded',
            props.defaultInfoExpanded
        )
        const quickStartExpanded = useLocalStorageFlag(
            'fega.submissionInfo.quickStartExpanded',
            true
        )
        return { stepsExpanded, encryptionExpanded, quickStartExpanded }
    }
})
</script>
