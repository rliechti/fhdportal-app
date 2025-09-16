<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-autocomplete
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-messages="control.errors"
      :clearable="control.enabled"
      :model-value="control.data"
      :items="sortedResources"
      :item-title="resourceTypeTitle"
      :item-value="resourceTypeValue"
      v-bind="vuetifyProps('v-select')"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <p class="mb-5 mt-0 text-subtitle-2 text-info" v-if="resourceName">
      <code>{{ inputValue }}</code>
    </p>
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
import { defineComponent, ref, onMounted, type PropType, type ComputedRef, watch } from 'vue'
import { VAutocomplete } from 'vuetify/components'
import {
  useVuetifyControl,
  ControlWrapper,
  DisabledIconFocus,
} from '@jsonforms/vue-vuetify'
import { useSampleStore } from '@/stores/samples'
import { useExperimentStore } from '@/stores/experiments'
import { useSubmissionStore } from '@/stores/submissions'
import _ from 'lodash'

interface ResourceStore {
  getStudySamples?: (params: { study_id: string }) => Promise<void>
  getStudyExperiments?: (params: { study_id: string }) => Promise<void>
  getStudyAnalysisFiles?: (params: { study_id: string }) => Promise<void>
  getStudyFiles?: (params: { study_id: string }) => Promise<void>
  samples?: any[]
  experiments?: any[]
  study?: {
    analysis_files?: any[]
    files?: any[]
  }
}

export default defineComponent({
  name: 'ReferenceResourceControlRenderer',
  components: {
    ControlWrapper,
    VAutocomplete,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const adaptValue = (value: unknown) => 
      typeof value === 'number' ? value : value || undefined
      
    const input = useVuetifyControl(useJsonFormsControl(props), adaptValue)
    const inputValue = ref<string>(input.control.value.data as string || '')
    const resourceType = ref<string>(input.control.value.schema["x-check"] as string || '')
    
    const resourceTypeTitle = ref<string>(
      input.control.value.schema["x-check_title"] as string || 'title'
    )
    const resourceTypeValue = ref<string>(
      input.control.value.schema["x-check_value"] as string || 'public_id'
    )    
    const errorMessage = ref<string>('')
    const resourceName = ref<string>('')
    const resources = ref<Array<Record<string, unknown>>>([])
    const resourceStore = ref<ResourceStore>({})
    const storeMethod = ref<string>('')
    const resourceItems = ref<string>('')

    const submissionStore = useSubmissionStore()
    const study = submissionStore.study

    const deepGet = (obj: Record<string, any>, keys: string[]): any => 
      keys.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj)

    const deepGetByPath = (obj: Record<string, any>, path: string): any => 
      deepGet(
        obj,
        path.replace(/\[([^[]]*)\]/g, '.$1.')
          .split('.')
          .filter((t: string) => t !== '')
      )

    const getResourceInit = async (value: string): Promise<void> => {
      if (!study?.public_id) return

      if (resourceType.value.match(/sample/i)) {
        resourceStore.value = useSampleStore()
        storeMethod.value = 'getStudySamples'
        resourceItems.value = 'samples'
      } else if (resourceType.value.match(/experiment/i)) {
        resourceStore.value = useExperimentStore()
        storeMethod.value = 'getStudyExperiments'
        resourceItems.value = 'experiments'
      } else if (resourceType.value.match(/file/i)) {
        resourceStore.value = useSubmissionStore()
        storeMethod.value = resourceType.value.match(/analys/i) 
          ? 'getStudyAnalysisFiles' 
          : 'getStudyFiles'
        resourceItems.value = resourceType.value.match(/analys/i)
          ? 'study.analysis_files'
          : 'study.files'
      }

      if (value && storeMethod.value) {
        inputValue.value = value
        await getResource()
      }

      if (resourceStore.value && resourceItems.value) {
        resources.value = deepGetByPath(resourceStore.value, resourceItems.value) || []
      }
    }

    const getResource = async (): Promise<void> => {
      resourceName.value = ''
      if (!storeMethod.value || !resourceStore.value[storeMethod.value]) return

      try {
        await resourceStore.value[storeMethod.value]!({ study_id: study.public_id })
        const items = deepGetByPath(resourceStore.value, resourceItems.value) || []
        resources.value = items

        items.forEach((item: Record<string, unknown>) => {
          const itemValue = deepGetByPath(item, resourceTypeValue.value)
          if (itemValue === inputValue.value) {
            resourceName.value = deepGetByPath(item, resourceTypeTitle.value) as string
          }
        })
      } catch (e: unknown) {
        errorMessage.value = e instanceof Error ? e.message : String(e)
      }
    }

    onMounted(() => void getResourceInit(inputValue.value))
    
    // watch works directly on a ref
    watch(
      () => input.control.value.data,
      async (newValue, oldValue) => {
        if (newValue){
          inputValue.value = newValue
          await getResource()
        }
      }
    )    
    return {
      ...input,
      adaptValue,
      inputValue,
      resourceName,
      errorMessage,
      study,
      resources,
      resourceTypeTitle,
      resourceTypeValue,
      deepGetByPath,
    }
  },
  computed: {
    step(): number {
      return (this.appliedOptions as { step?: number }).step ?? 1
    },
    sortedResources(): Array<Record<string, unknown>> {
      return this.resourceTypeTitle
        ? _.orderBy(this.resources, (r) =>
            this.deepGetByPath(r, this.resourceTypeTitle)
          )
        : this.resources
    }
  }
})
</script>