<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title>{{title}}</v-card-title>
      <json-forms
        :data="formData"
        :schema="dataSchema"
        :uischema="uiSchema"
        :renderers="renderers"
      />
      <user-keys type="c4gh" :show='true' v-if="!readonly"></user-keys>
      
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

import { mapState } from 'pinia'

import _ from 'lodash'
const renderers = [
  ...vuetifyRenderers
]

export default defineComponent({
  name: 'ModalPolicyForm',
  props: ['dataset_id','policy_id','form','readonly'],
  components: {
    JsonForms,
    UserKeys
  },
  computed: {
    ...mapState(useAuthStore, ['user'])
  },
  data () {
    return {
      title: '',
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
        c4gh_public_key: ""
      },
      loaded: false,
      disabled: false,
      renderers: Object.freeze(renderers)
    }
  },
  methods: {
    closeModal () {
      this.$emit('closePolicyModal')      
    }
  },
  mounted () {
    // const dacStore = useDacStore()
    // const store = useAuthStore()
    // if (!store.authenticated) {
    //   store.login()
    //   return false
    // }
    // const form_type = form.replace("-form","")
    // dacStore.getPolicyForm(dataset_id, policy_id, form).then(data => {
    //   this.loaded = true
    //   this.uiSchema = data[form_type].uiSchema
    //   this.dataSchema = data[form_type].schema
    //   this.formData = data[form_type].initialValues
    //   this.title = form_type.toUpperCase()+" form"
    // }).catch(err => this.$notify({type: 'danger',text: err}))
    this.formData.username = this.user.username
  }
})
</script>
