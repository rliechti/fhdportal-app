<template>
  <div class="Files">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container>
      <v-dialog v-model="modal.status" width="95%">
      <v-card width="100%">
        <v-card-title>  File {{modal.filename}}</v-card-title>
        <v-card-text>
           <v-data-table class="mt-5":items="modal.datasets" :headers='dataset_headers' density="compact" >
           <template #item.creation_date="{ value }"> {{formatDate(value)}} </template>
           <template #item.last_update="{ value }"> {{formatDate(value)}} </template>
           <template #item.released_date="{ value }"> {{formatDate(value)}} </template>
           <template #item.study_title="{ item }"> <router-link :to="`/studies/${item.study_public_id}`">{{item.study_title}}</router-link> </template>
           <template #item.title="{ item }"> <router-link :to="`/datasets/${item.public_id}`">{{item.title}}</router-link> </template>

           <template #item.creator_name="{ value }">
             <v-chip color="blue" size="small">
               {{ value.replace(/([^A-Z])/g, '').trim() }}
               <v-tooltip activator="parent" location="top" ><span v-html="value.replace(/([A-Z])/g, ' $1').trim()" /></v-tooltip>
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <p class="text-center my-5"> <v-btn color="secondary" variant="outlined" class="ml-2" @click="close(true)" > Close </v-btn> </p>
        </v-card-actions>
            
      </v-card>
      </v-dialog>
      
        <h1 class="text-center mb-5">My uploaded files (c4gh-encrypted)</h1>
        <div >
          <h3 class="text-center mt-3 d-flex align-center pe-2" v-if="nb.total>0">

            <v-icon icon="mdi-folder"></v-icon>&nbsp; <span v-if="nb.filtered && nb.filtered!=nb.total">{{nb.filtered}} / </span>{{ nb.total }} File<span v-if="nb.total > 1">s</span>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" label="Search by name" density="compact" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line @update:model-value="searchFiles"></v-text-field>
            <v-select v-model="status" label="filter by status" :items="status_list" density="compact" style="max-width:200px;padding-top:23px;margin-left:5px" @update:model-value="changePagination(true)"></v-select>
          </h3>

          <v-sheet border rounded>

            <v-data-table class="mt-5" :loading="loading" :items="files" :headers="headers" :items-per-page="page.by" density="compact" >
            <template #no-data>
                <div class="pa-4 text-center">
                  <p class="text-center" v-if="nb.total==0"> No files yet. Please upload it</p>
                  <p class="text-center" v-else> No files matching these filters </p>
                </div>
              </template>
                <template v-slot:loading > <v-skeleton-loader type="table-row@5"></v-skeleton-loader> </template>

                <template #item.title="{ item }">
                  <small>
                    
                    <span v-if="item.title.length>50"> <v-tooltip activator="parent" location="top" >{{ item.title }} </v-tooltip> {{item.title.substr(0,50)}}...</span>
                    <span v-else>{{ item.title }}</span>
                  </small>
                  <v-chip variant="text" class="text-info" @click="copy(item.public_id)" > <v-icon icon="mdi-information"></v-icon> <v-tooltip activator="parent" location="top" >{{ item.public_id }} </v-tooltip> </v-chip>
                </template>
                <template #item.status="{ item }"> 
                  <v-chip :color="getStatusClass(item.status,'class_name')" size="small">
                    {{ getStatusClass(item.status,'name') }}
                    <template v-if="item.comment">
                      <v-icon icon="mdi-information ml-2"></v-icon>
                      <v-tooltip activator="parent" location="top"
                        >{{ item.comment }}
                      </v-tooltip>
                    </template>
                  </v-chip>
                </template>

                <template #item.filesize="{ value }"> {{formatFileSize(value)}} </template>

                <template #item.datasets="{ item }">
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="showResource(item,'Dataset')" v-if="item.datasets.length">
                  <v-icon class="mr-1" icon="mdi-eye-outline" />
                  {{ item.datasets.length }}
                </v-btn>
                  <!-- <v-chip v-if="value.length">{{ value.length }}</v-chip> -->
                </template>
                <template #item.studies="{ value }"> <v-chip v-if="value.length">{{ value.length }}</v-chip> </template>

                <template #item.creation_date="{ value }"> {{formatDate(value)}} </template>
                <template #item.verif_date="{ value }"> {{formatDate(value)}} </template>
                <template #item.published_date="{ value }"> {{formatDate(value)}} </template>
                
                <template v-slot:bottom>
                  <div class="d-flex align-center justify-end w-100" v-if="nb.filtered>0">
                   <v-select v-model="page.by" label=" Items per page" :items="[5,10,50,100,500]" density="compact" style="max-width:120px;padding-top:15px" @update:model-value="changePagination(true)"></v-select>
                   <span class="mx-4">{{page.message}} </span>
                    <v-pagination v-model="page.current" :length="page.nb" class="my-4" v-if="page.nb>1" total-visible="4" color="grey" @update:model-value="changePagination()"></v-pagination>
                 </div>
                 </template>
            </v-data-table>
          </v-sheet>
        </div>

      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import HTTP from '@/services/api'
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import StudyList from '@/views/StudyList.vue'
import { useFileStore } from '@/stores/files.js'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useAnalysisStore } from '@/stores/analyses.js'
import { useDatasetStore } from '@/stores/datasets.js'
import { useSchemaStore } from '@/stores/schemas.js'
import UserKeys from '@/components/UserKeys.vue'
import { mapState } from 'pinia'
import Encryption from '@/assets/documentation/Encryption.md'
import SshKey from '@/assets/documentation/SshKey.md'
import UploadSteps from '@/assets/documentation/UploadSteps.md'
import WarningSensitive from '@/assets/documentation/WarningSensitive.md'
  import useClipboard from 'vue-clipboard3'
import { useTheme } from 'vuetify';
import _ from 'lodash'
import moment from 'moment'

export default defineComponent({
  name: 'Files',
  components: {
    UserKeys,
    StudyList,
    Encryption,
    SshKey,
    UploadSteps,
    WarningSensitive
  },
  data() {
    return {
      files:[],
      modal:{status:false},
      filterTimeout:null,
      search:'',
      status:null,
      status_list :[],
      nb:{total:0,filtered:0},
      page:{current:1,nb:5,by:50,message:''},
      loading:true,
      loaded:false,
      dataset_headers:[
      {title:'Study',value:'study_title'},
      {title:'Dataset',value:'title'},
      {title:'Created by',value:'creator_name'},
    {title:'Date', align: 'center',
        children: [
          { title: 'Creation', value: 'creation_date' },
          { title: 'Update', value: 'last_update' },
          { title: 'Release', value: 'released_date' },
        ]},
        
      ],
      headers:[{title:'Status',value:'status'},
      {title:'Name',value:'title'},
      {title:'Date', align: 'center',
          children: [
            { title: 'Creation', value: 'creation_date' },
            { title: 'Verification', value: 'verif_date' },
            { title: 'Publication', value: 'published_date' },
          ]},
      // {title:'Creation date',value:'creation_date'},
      // {title:'Verified date',value:'verif_date'},
      // {title:'Published date',value:'published_date'},
      {title:'Size',value:'filesize'},
      {title:'Datasets',value:'datasets',align:'center'}],
      alert: {
        steps: true,
        sshkey: false,
        encryption: false
      }
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    ...mapState(useFileStore, ['files']),
    ...mapState(useSubmissionStore, ['study']),
    ...mapState(useDatasetStore, ['datasets']),
    ...mapState(useAnalysisStore, ['analyses']),
    ...mapState(useSchemaStore, ['schemas']),
    ...mapState(useSubmissionStore, ['statusTypes']),
    alertTextColor () {
      const theme = useTheme();
      return (theme.name.value.indexOf("DARK") > -1) ? "#BBF" : "#55B"
    }
  },
  mounted() {
    this.fileStore = useFileStore()
    this.submissionStore = useSubmissionStore()
    this.submissionStore.getStatusTypes()
    // this.analysisStore = useAnalysisStore()
    this.datasetStore = useDatasetStore()
    _.forEach(this.defaultTableHeaders, function (sh) {
      sh.headerProps = { style: 'font-weight: 600' }
    })
    this.getFiles();

  },
  methods: {
    close(reload) {
      this.modal = {status:false};
    },
    showResource(obj,type){
      this.modal = {
        status: true,
        filename:obj.name,
        title: `View Datasets`,
        datasets:obj.datasets
      }
    }, 
    async copy(msg) {
      const { toClipboard } = useClipboard()
      try {
        await toClipboard(msg)
        this.$notify({
          type: 'success',
          text: 'Public File ID copied to clipboard',
        })
      } catch (e) {
        console.error(e)
      }
    },
    searchFiles(){
			if (this.filterTimeout) { clearTimeout(this.filterTimeout) }
			this.filterTimeout = setTimeout(() => {
        // this.getFiles();
        this.changePagination(true);
			},500);
    },
    getFiles(){
      let params = {page:this.page,search:this.search,status:this.status};
      this.loading = true;
      this.fileStore.getFiles(params).then((files) => {
        this.files = files.data;
        this.nb = {total:files.params.total,filtered:files.params.filtered};
        this.computePagination();
        this.status_list = files.params.status_list;
        this.loading = false;
        this.loaded = true;
      })
    },
    changePagination(init){
      if (init){ this.page.current = 1; }
      this.getFiles();
    },
    computePagination(){
      let nb_pages =  Math.ceil(this.nb.filtered/this.page.by);
      this.page.nb = nb_pages;
      let from = (this.page.current-1)*this.page.by+1;
      let to = Math.min(this.page.current*this.page.by,this.nb.filtered);
      this.page.message =from + "-" + to + " of "+this.nb.filtered; 
    },
    formatFileSize(bytes, decimalPoint = 2) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024; // Use 1024 for binary-based sizes
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
    },

    formatDate(value) {
      if (value) return moment(value).format('DD.MM.YYYY')
    },
    getStatusClass(status_type,attr) {
      let idx = _.findIndex(this.statusTypes, (sT) => {
        return sT.id === status_type
      })
      if (idx > -1) {
        return this.statusTypes[idx][attr]
      }
    },
  },
})
</script>
