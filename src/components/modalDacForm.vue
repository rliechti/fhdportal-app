<template>
  <v-container style="overflow: auto">
    <v-card width="100%">
      <v-card-title>{{title}}</v-card-title>

      <json-forms
        :data="formData"
        :schema="dataSchema"
        :renderers="renderers"
      />
      <!-- <json-forms
        :data="formData"
        :schema="dataSchema"
        :uischema="uiSchema"
        :renderers="renderers"
      /> -->
      <user-keys type="c4gh" :show='true' v-if="!readonly"></user-keys>
      <!-- <p class="text-center my-5">
        <v-btn
          color="secondary"
          variant="outlined"
          class="ml-2"
          @click="closeModal"
        >
          Cancel
        </v-btn>
      </p> -->
      
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
  name: 'ModalDacForm',
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
      this.$emit('closeDacModal')      
    }
  },
  mounted () {
    const dacStore = useDacStore()
    const store = useAuthStore()
    if (!store.authenticated) {
      store.login()
      return false
    }
    this.dataSchema = this.form.schema
    this.formData = JSON.parse(JSON.stringify(this.form.initialValues))
  }
})
</script>
