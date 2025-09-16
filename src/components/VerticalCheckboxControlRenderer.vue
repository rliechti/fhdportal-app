<template>
  <v-container fluid v-if="control.visible">
    <v-card variant="flat" title="Dataset types">
      <v-list lines="one">
        <v-list-item
          v-for="(o, index) in control.options"
          :key="o.value"
          style="height: 1em"
        >
          <template v-slot:prepend="{ }">
            <v-list-item-action start>
              <v-checkbox
                :label="o.label"
                :model-value="dataHasEnum(o.value)"
                :id="control.id + `-input-${index}`"
                :path="composePaths(control.path, `${index}`)"
                :error-messages="control.errors"
                :disabled="!control.enabled"
                :indeterminate="control.data === undefined"
                v-bind="vuetifyProps(`v-checkbox[${o.value}]`)"
                @update:model-value="() => toggle(o.value)"
              />
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { type ControlElement, composePaths } from '@jsonforms/core'
import { VCheckbox, VContainer } from 'vuetify/components'
import {
  rendererProps,
  type RendererProps,
  useJsonFormsMultiEnumControl,
} from '@jsonforms/vue'
import { defineComponent } from 'vue'
import { useVuetifyBasicControl } from '@jsonforms/vue-vuetify'

const controlRenderer = defineComponent({
  name: 'enum-array-renderer',
  components: {
    VCheckbox,
    VContainer
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyBasicControl(useJsonFormsMultiEnumControl(props))
  },
  methods: {
    dataHasEnum(value: any) {
      return !!this.control.data?.includes(value)
    },
    composePaths,
    toggle(value: any) {
      if (!this.dataHasEnum(value)) {
        this.addItem(this.control.path, value)
      } else {
        // mistyped in core
        this.removeItem?.(this.control.path, value)
      }
    },
  },
})

export default controlRenderer
</script>
