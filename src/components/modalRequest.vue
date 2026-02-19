<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title>Request Access to Dataset: {{dataset_title}}</v-card-title>
      <v-card-text>
      <json-forms
        :data="formData"
        :schema="dataSchema"
        :uischema="uiSchema"
        :renderers="renderers"
        @change="updateData"
      />
      <user-keys type="c4gh" :show='true'></user-keys>
      </v-card-text>
      <v-card-actions>
        <p class="text-center my-5">
          <v-btn color="primary" variant="outlined" class="mx-2" :disabled="disabled" @click="submitRequest">Send request</v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            class="ml-2"
            @click="closeModal"
          >
            Cancel
          </v-btn>
        </p>
      </v-card-actions>
            
    </v-card>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue'
import { useDacStore } from '@/stores/dacs.js'
import { useAuthStore } from '@/stores/auth'
import { JsonForms } from '@jsonforms/vue'
import { vuetifyRenderers } from '@jsonforms/vue-vuetify'
import UserKeys from '@/components/UserKeys.vue'
import ModalPolicyForm from '@/components/modalPolicyForm.vue'
import { mapState } from 'pinia'

import _ from 'lodash'
const renderers = [
  ...vuetifyRenderers
]

export default defineComponent({
  name: 'ModalResource',
  props: ['dataset_id', 'dataset_title','policy_id'],
  components: {
    JsonForms,
    UserKeys
  },
  computed: {
    ...mapState(useAuthStore, ['user'])
  },
  data () {
    return {
      uiSchema: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/username",
            label: "Login Name",
            options: {
              readonly: true
            }
          },
          {
            type: "Control",
            scope: "#/properties/institution",
            label: "Institution"
          },
          {
            type: "Control",
            scope: "#/properties/comment",
            label: "Comment",
            options: {
                multi: true,
                rows: 5,
                widget: "textarea"
            }
          }
        ]
      },
      dataSchema: {
        type: "object",
        properties: {
      		username: {
      			type: "string",
      			minLength: 3,
      			description: "login name",
            readOnly: true
      		},
          institution: {
            type: "string",
            minLength: 3,
            description: "Please enter the name of your institution"
          },
          comment: {
            type: "string",
      			minLength: 10
          },
          c4gh_public_key: {
            type: "string",
            minLength: 10
          }
        },
        required: [
      		"username",
          "institution",
          "comment"
        ]
      },
      formData: {
        username: "",
        institution: "",
        comment: "",
        c4gh_public_key: "",
        dataset_id: ""
      },
      loaded: false,
      disabled: false,
      renderers: Object.freeze(renderers),
      // modalPolicy: {
      //   status: false,
      //   dataset_id: null,
      //   policy_id:null,
      //   form: null
      // }
    }
  },
  methods: {
    closeModal () {
      this.$emit('closeModal')      
    },
    updateData(event) {
      let _this = this
      let dis = false
      this.formData = event.data
      _.forEach(_this.dataSchema.required, function (r) {
        if (!_this.formData[r]) {
          dis = true
        }
      })
      this.disabled = dis
      if (this.user.c4ghPublicKeys === undefined || this.user.c4ghPublicKeys.length < 1){
        this.disabled = true
      }
    },
    submitRequest (){
      const dacStore = useDacStore()
      this.formData.c4gh_public_key = this.user.c4ghPublicKeys[0]
      dacStore.submitRequest(this.formData).then((msg) => {
        this.$notify({type: "success", title: "request sent successfully", text: msg})
        this.closeModal();
      }).catch(err =>{
        this.$notify({type: "error",title: err})

      })
    }
  },
  mounted () {
    this.formData.username = this.user.username
    this.formData.dataset_id = this.dataset_id
    // const dacStore = useDacStore()
    // const store = useAuthStore()
    // if (!store.authenticated) {
    //   store.login()
    //   return false
    // }
    // const dataset_id = this.dataset_id
    // dacStore.getRequestForm(dataset_id).then(res => {
    //   this.uiSchema = res.data.uiSchema
    //   this.dataSchema = res.data.formSchema
    //   this.formData = res.data.formData
    //   this.formData.username = this.user.username
    //   this.formData.datasetID = this.dataset_id
    //   this.loaded = true
    // }).catch(err => {
    //   this.$notify({type: "error", message: err})
    // })
  }
})
</script>
