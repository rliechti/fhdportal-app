<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-text-field
      v-disabled-icon-focus
      :step="step"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-message="errorMessage"
      :error-messages="control.errors"
      :model-value="inputValue"
      :clearable="control.enabled"
      v-bind="vuetifyProps('v-text-field')"
      @update:model-value="onInputChange"
      @focus="handleFocus"
      @blur="handleBlur"
    ></v-text-field>
    <p v-if="pubmedTitle" class="h6">{{ pubmedTitle }}</p>
    <!-- <v-alert type="success" variant="outlined" class="mb-5" v-if="pubmedTitle">{{
      pubmedTitle
    }}</v-alert> -->
    <v-alert
      type="error"
      variant="outlined"
      class="mb-5"
      v-else-if="errorMessage"
      >{{ errorMessage }}</v-alert
    >
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import {
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue'
import { computed, defineComponent, ref } from 'vue'
import { VTextField } from 'vuetify/components'
import {
  useVuetifyControl,
  ControlWrapper,
  DisabledIconFocus,
} from '@jsonforms/vue-vuetify'
import { useSubmissionStore } from '@/stores/submissions.js'

const NUMBER_REGEX_TEST = /^[+-]?\d+([.]\d+)?([eE][+-]?\d+)?$/

const controlRenderer = defineComponent({
  name: 'identifier-control-renderer',
  components: {
    ControlWrapper,
    VTextField,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  data() {
    return {
      pubmedTitle: '',
      errorMessage: '',
    }
  },
  setup(props: RendererProps<ControlElement>) {
    const adaptValue = (value: any) =>
      typeof value === 'number' ? value : value || undefined
    const input = useVuetifyControl(useJsonFormsControl(props), adaptValue)
    const inputValue = ref((input.control.value.data as string) || '')

    const allowUnsafeInteger = computed(
      () => input.appliedOptions.value.allowUnsafeInteger,
    )
    const toNumberOrString = (value: string): number | string => {
      if (NUMBER_REGEX_TEST.test(value)) {
        const num = Number.parseFloat(value)
        if (
          Number.isFinite(num) &&
          (allowUnsafeInteger.value || Number.isSafeInteger(num))
        ) {
          return num
        }
      }
      return value
    }

    const dataValue = computed(() => toNumberOrString(inputValue.value))
    return { ...input, adaptValue, inputValue, dataValue, toNumberOrString }
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions
      return options.step ?? 1
    },
    allowUnsafeInteger(): boolean {
      return this.appliedOptions.allowUnsafeInteger
    },
  },
  watch: {
    'control.data': {
      handler(newData) {
        if (newData !== this.dataValue) {
          this.inputValue = newData
        }
      },
    },
  },
  mounted() {
    if (this.control.data) {
      this.onInputChange(this.control.data)
    }
  },
  methods: {
    async onInputChange(value: string): Promise<void> {
      this.inputValue = value
      this.onChange(this.toNumberOrString(value))
      this.pubmedTitle = ''
      this.errorMessage = ''
      if (value) {
        const submissionStore = useSubmissionStore()
        try {
          const response = await submissionStore.getPubmeds(value)
          if (response instanceof Object && response[value]) {
            const article = response[value]
            this.pubmedTitle = article.title
          } else {
            this.errorMessage = 'Invalid PubMed ID'
          }
        } catch {
          this.errorMessage = 'Error fetching PubMed data'
        }
      }
    },
  },
})

export default controlRenderer
</script>
