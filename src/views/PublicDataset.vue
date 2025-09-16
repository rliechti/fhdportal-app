<template>
  <div class="Datasety">
    <v-sheet min-height="70vh" rounded="lg">
    <v-dialog v-model="modal.status" width="50%">
      <modal-request :dataset_id="modal.dataset_id" :dataset_title="modal.title" @closeModal="modal.status=false"></modal-request>
    </v-dialog>    
    <v-container>
    <v-row class="mt-10">
      <v-col cols="8" class="offset-2">
        <v-card color="info" variant = "outlined" v-if="loading">
          <h5 class="text-center py-3">loading...</h5>
        </v-card>
        <v-card color="warning" v-else-if="errorMsg">
          <h3 class="text-center py-3">{{errorMsg}}</h3>
        </v-card>
        <v-card v-else>
          <v-card-title>{{dataset.title}}</v-card-title>
          <v-card-subtitle>{{dataset.public_id}}</v-card-subtitle>
          <v-card-text>
            <v-row>
              <template v-for="(v,k) in dataset" :key="k">
                <template v-if="!Array.isArray(v) && k !== 'id' && k !== 'policy_id' && typeof v !== 'object'">
                  <v-col cols="4 text-right"><strong>{{k.replace(/_/g," ")}}:</strong></v-col>
                  <v-col cols="8">
                    <router-link :to="`/studies/${v}`" v-if="k==='study_public_id'">{{v}}</router-link>
                    <template v-else>{{v}}</template>
                  </v-col>                  
                </template>
                <template v-else-if="k==='extra_attributes'">
                  <template v-for="xa in v" :key="xa.tag">
                    <v-col cols="4 text-right"><strong>{{xa.tag.replace(/_/g," ")}}:</strong></v-col>
                    <v-col cols="8">{{xa.value}}</v-col>                  
                  </template>
                </template>
                <template v-else-if="k==='dataset_types'">
                  <v-col cols="4 text-right"><strong>{{k.replace(/_/g," ")}}:</strong></v-col>
                  <v-col cols="8"><v-chip size="small" v-for="dataset_type in v" :key = "`${k}_${dataset_type}`">{{dataset_type}}</v-chip></v-col>
                  
                </template>
                <template v-else-if="k==='policy'">
                  <v-col cols="4 text-right"><strong>{{k.replace(/_/g," ")}}:</strong></v-col>
                  <v-col cols="8"><strong>{{v.title}}</strong> from {{v.dac.name}}</v-col>
                  
                </template>
              </template>
            </v-row>
            <p class="text-center my-6"><v-btn size="small" color="primary" @click="requestAccessForm(dataset.id, dataset.title)">request access...</v-btn></p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-title v-if="dataset.files !== undefined">Files ({{dataset.files.length}})</v-card-title>
          <v-card-text>
          <v-table
             height="600px"
             fixed-header
             density="compact"
           >
             <thead>
               <tr>
                 <th class="text-left">
                   Public ID
                 </th>
                 <th class="text-left">
                   Name
                 </th>
                 <th class="text-left">
                   Size
                 </th>
               </tr>
             </thead>
             <tbody>
               <tr
                 v-for="item in dataset.files"
                 :key="item.public_id"
               >
                 <td>{{ item.public_id }}</td>
                 <td><small>{{ item.title }}</small></td>
                 <td nowrap>{{ formatFileSize(item.filesize) }}</td>
               </tr>
             </tbody>
           </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState } from 'pinia'
import { useDatasetStore } from '@/stores/datasets.js'
import { useDacStore } from '@/stores/dacs.js'
import { useAuthStore } from '@/stores/auth'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers } from '@jsonforms/vue-vuetify'
import UserKeys from '@/components/UserKeys.vue'
import ModalRequest from '@/components/modalRequest.vue'
import _ from 'lodash'
const renderers = [
  ...vuetifyRenderers
]

export default defineComponent({
  name: 'Dataset',
  components: {
    JsonForms,
    UserKeys,
    ModalRequest
  },
  computed: {
    ...mapState(useDatasetStore, ['dataset']),
    ...mapState(useAuthStore, ['user'])
  },
  data() {
    return {
      loading: false,
      errorMsg: '',
      modal: { status: false, dataset_id: null, title: '' }
    }
  },
  methods: {
    formatFileSize(bytes, decimalPoint = 2) {
      if (bytes === 0) return '0 Bytes';
  
      const k = 1024; // Use 1024 for binary-based sizes
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
    },
    requestAccessForm (dataset_id, title){
      this.modal.status = true
      this.modal.dataset_id = dataset_id
      this.modal.title = title
    }
  },
  mounted(){
    const datasetStore = useDatasetStore()
    const dataset_id = this.$route.params.dataset_id
    datasetStore.getDataset(dataset_id).then(() => {
      this.loading = false
      this.errorMsg = '';
    }).catch(err => {
      this.loading = false
      if (err.status === 404){
        this.errorMsg = "Unknwown dataset"
      }
      else{
        this.errorMsg = "Error retrieving the dataset"
      }
    })
    
  }
})
</script>
