<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title>{{title}}</v-card-title>
      <!-- <json-forms
        :data="formData"
        :schema="dataSchema"
        :uischema="uiSchema"
        :renderers="renderers"
        v-if="loaded"
      /> -->
      <json-forms
        :schema="dataSchema"
        :data="formData"
        :renderers="renderers"
        v-if="loaded"
        :readonly="readonly"
      />
      <user-keys type="c4gh" :show='true' v-if="!readonly"></user-keys>
      <p class="text-center my-5">
        <v-btn
          color="secondary"
          variant="outlined"
          class="ml-2"
          @click="closeModal"
        >
          Cancel
        </v-btn>
      </p>
      
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
      uiSchema: {},
      dataSchema: {},
      formData: {},
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
    const dacStore = useDacStore()
    const store = useAuthStore()
    if (!store.authenticated) {
      store.login()
      return false
    }
    const dataset_id = this.dataset_id
    const policy_id = this.policy_id
    const form = this.form
    const form_type = form.replace("-form","")
    dacStore.getPolicyForm(dataset_id, policy_id, form).then(data => {
      this.loaded = true
      this.uiSchema = data[form_type].uiSchema
      this.dataSchema = data[form_type].schema
      this.formData = data[form_type].initialValues
      this.title = form_type.toUpperCase()+" form"
    }).catch(err => this.$notify({type: 'danger',text: err}))

  }
})
</script>
