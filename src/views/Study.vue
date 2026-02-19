<template>
  <div class="Study">
    <v-sheet min-height="70vh" rounded="lg">
    <v-dialog v-model="modal.status" width="50%">
      <modal-request :dataset_id="modal.dataset_id" :dataset_title="modal.title" @closeModal="closeModal"></modal-request>
    </v-dialog>    
    <v-container>
    <v-row class="mt-10">
      <v-col cols="8" class="offset-2">
      
        <v-card color="info" variant="outlined" v-if="loading">
          <h5 class="text-center py-3">loading...</h5>
        </v-card>
        <v-card color="warning" v-else-if="errorMsg">
          <h3 class="text-center py-3">{{errorMsg}}</h3>
        </v-card>
        <v-card v-else>
          <v-card-title>{{study.title}}</v-card-title>
          <v-card-subtitle>{{study.public_id}}</v-card-subtitle>
          <v-card-text>
            <v-row>
              <template v-for="(v,k) in study" :key="k">
                <template v-if="!Array.isArray(v) && k !== 'id'">
                  <v-col cols="4 text-right"><strong>{{k.replace(/_/g," ")}}:</strong></v-col>
                  <v-col cols="8">{{v}}</v-col>                  
                </template>
                <template v-else-if="k==='extra_attributes'">
                  <template v-for="xa in v" :key="xa.tag">
                    <v-col cols="4 text-right"><strong>{{xa.tag.replace(/_/g," ")}}:</strong></v-col>
                    <v-col cols="8">{{xa.value}}</v-col>                  
                  </template>
                </template>
              </template>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-title>Datasets</v-card-title>
          <v-card-text>
          <v-list
              lines="three"
              density="compact"
            >
            <v-list-item v-for="item in study.datasets" :key="item.public_id">
              <v-list-item-title>
                <v-row
                  no-gutters
                >
                  <v-col
                    cols="10"
                    style="padding: 0 !important"
                  >
                      <h4 class="text-wrap"><router-link :to="`/datasets/${item.public_id}`">{{item.public_id}}</router-link> - {{item.title}}</h4>
                  </v-col>

                  <v-col
                    cols="2"
                    class="align-right"
                  >
                    <v-chip class="float-right" size="small" color="info">{{item.nb_samples}} sample{{item.nb_samples>1?'s':''}}</v-chip>
                  </v-col>
                </v-row>
              </v-list-item-title>
              <p class="text-caption py-2">
                <v-chip v-for="type in item.types" :key="`${item.public_id}-${type}`"  size="small">{{type}}</v-chip>
                <v-btn class="float-right" size="small" color="primary" @click="requestAccessForm(item.id,item.title)" v-if="item.request === undefined || item.request === null || item.request.dataset_id === undefined">request access...</v-btn>
                <template v-else><strong class="float-right" :class="item.request.request_status==='approved'?'text-success':(item.request.request_status==='rejected'?'text-error':'text-info')">Access request {{item.request.request_status}} on {{formatDate(item.request.action_time)}}</strong></template>
                
                <!-- <v-btn class="float-right" size="small" color="primary" @click="getPolicyForm(item.public_id, item.policy_id,'daa-form')">request access...</v-btn> -->
              </p>
              <p class="">{{item.description}}</p>
            </v-list-item>
          </v-list>
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
import { useStudyStore } from '@/stores/studies.js'
import { useDacStore } from '@/stores/dacs.js'
// import ModalPolicyForm from '@/components/modalPolicyForm.vue'
import ModalRequest from '@/components/modalRequest.vue'
import moment from 'moment'
export default defineComponent({
  name: 'Study',
  components: { ModalRequest },
  computed: {
    ...mapState(useStudyStore, ['study']),
  },
  data() {
    return {
      loading: false,
      errorMsg: '',
      // modalPolicy: { status: false, dataset_id: null, title: '',policy_id: null, form: null }
      modal: { status: false, dataset_id: null, title: '' }
    }
  },
  methods: {
    closeModal(){
      this.modal.status = false
      this.getStudy()
    },
    getStudy(){
      const studyStore = useStudyStore()
      const study_id = this.$route.params.study_id
      this.loading = true
      studyStore.getStudy(study_id).then(() => {
        this.loading = false
        this.errorMsg = '';
      }).catch(err => {
        this.loading = false
        if (err.status === 404){
          this.errorMsg = "Unknown study"
        }
        else{
          this.errorMsg = "Error retrieving the study"
        }
      })      
    },
    requestAccessForm (dataset_id, title){
      this.modal.status = true
      this.modal.dataset_id = dataset_id
      this.modal.title = title
    },    
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    }
    
    // getPolicyForm (dataset_id, policy_id, form){
    //   this.dacStore.getPolicyForm(dataset_id, policy_id, form).then(data => {
    //     this.modalPolicy.status = true
    //     this.modalPolicy.policy_id = policy_id
    //     this.modalPolicy.dataset_id = dataset_id
    //     this.modalPolicy.form = form
    //   }).catch(err => this.$notify({type: 'danger',text: err}))
    // }
  },
  mounted(){
    this.dacStore = useDacStore()
    this.getStudy()
  }
})
</script>
