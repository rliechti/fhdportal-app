<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title>{{title}}</v-card-title>
      <json-forms
        :data="formData"
        :schema="dataSchema"
        :uischema="uiSchema"
        :renderers="renderers"
        :readonly="readonly"
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
        // type: "VerticalLayout",
        // elements: [
        //   {
        //     type: "Control",
        //     scope: "#/properties/username",
        //     label: "Login Name",
        //     options: {
        //       readonly: true
        //     }
        //   },
        //   {
        //     type: "Control",
        //     scope: "#/properties/institution",
        //     label: "Institution"
        //   },
        //   {
        //     type: "Control",
        //     scope: "#/properties/comment",
        //     label: "Comment",
        //     options: {
        //         multi: true,
        //         rows: 5,
        //         widget: "textarea"
        //     }
        //   }
        // ]
      },
      dataSchema: {
        // type: "object",
        // properties: {
        //           username: {
        //             type: "string",
        //             minLength: 3,
        //             description: "login name",
        //     readOnly: true
        //           },
        //   institution: {
        //     type: "string",
        //     minLength: 3,
        //     description: "Please enter the name of your institution"
        //   },
        //   comment: {
        //     type: "string",
        //             minLength: 10
        //   },
        //   c4gh_public_key: {
        //     type: "string",
        //     minLength: 10
        //   }
        // },
        // required: [
        //           "username",
        //   "institution",
        //   "comment"
        // ]
      },
      formData: {
        // username: "",
        // institution: "",
        // comment: "",
        // c4gh_public_key: ""
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
  watch: {
    'form'(value){
      console.log(value)
    }
  },
  mounted () {
    const dacStore = useDacStore()
    const store = useAuthStore()
    if (!store.authenticated) {
      store.login()
      return false
    }
    this.uiSchema = this.form.uiSchema
    this.dataSchema = this.form.schema
    this.formData = this.form.initialValues
    this.title = this.form.schema.title

    // if (this.form){
    //   dacStore.getPolicyForm(this.dataset_id, this.policy_id, this.form).then(data => {
    //     console.log(data)
    //     this.loaded = true
    //   }).catch(err => this.$notify({type: 'danger',text: err}))
    // }
    this.formData.username = this.user.username
  }
})
</script>
