<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title
        >Download: dataset {{ download.dataset_public_id }}</v-card-title
      >
      <v-card-text>
        <Download
          style="padding: 20px 40px"
          :doa_bucket_name="download.doa_bucket_name"
          :doa_endpoint="download.doa_endpoint"
          :doa_access_key="download.doa_access_key"
          :doa_secret_key="download.doa_secret_key"
          :doa_session_token="download.doa_session_token"
          :doa_sts_token_expiration="download.doa_sts_token_expiration"
        />
      </v-card-text>
      <v-card-actions>
        <p class="my-5; w-100">
          <v-btn
            color="secondary"
            variant="outlined"
            class="ml-2"
            @click="closeModal"
          >
            Close
          </v-btn>
          <span class="float-right">
            The above tokens expire on {{ formatDate(download.doa_sts_token_expiration)}}
            <v-btn color="info" variant="outlined" class="ml-2" @click="refreshToken(download.request_id)" v-if="download.doa_sts_token_expiration < download.doa_object_expiration && isNotExpired(download.doa_sts_token_expiration)">Refresh token</v-btn>
          </span>
        </p>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue'
import Download from '@/assets/documentation/Download.md'
import _ from 'lodash'
import moment from 'moment'
export default defineComponent({
  name: 'ModalDownload',
  props: ['download'],
  components: {
    Download,
  },
  data() {
    return {}
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    isNotExpired (inputStr){
      return moment(inputStr).isAfter()
    },    
    formatDate(value) {
        return moment(value).format('DD.MM.YYYY HH:mm:ss')
    },
    refreshToken(requestId){
      this.$emit('refreshToken')
    }
  }  
})
</script>