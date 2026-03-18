<template>
    <div v-if="control.visible" class="px-0">
        <v-card :class="styles.arrayList.root" elevation="0">
            <v-card-title class="array-list-title">
                <span :class="styles.arrayList.label">{{ control.label || 'Dataset Types' }}</span>
            </v-card-title>
            <v-card-text class="pa-0 pb-1">
                <div v-for="(o, index) in control.options" :key="o.value" class="checkbox-item">
                    <v-checkbox
                        :label="o.label"
                        :model-value="dataHasEnum(o.value)"
                        :id="control.id + `-input-${index}`"
                        :path="composePaths(control.path, `${index}`)"
                        :error-messages="control.errors"
                        :disabled="!control.enabled"
                        :indeterminate="control.data === undefined"
                        density="compact"
                        hide-details
                        v-bind="vuetifyProps(`v-checkbox[${o.value}]`)"
                        @update:model-value="() => toggle(o.value)"
                    />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { type ControlElement, composePaths } from '@jsonforms/core'
import { VCheckbox } from 'vuetify/components'
import { rendererProps, type RendererProps, useJsonFormsMultiEnumControl } from '@jsonforms/vue'
import { defineComponent } from 'vue'
import { useVuetifyBasicControl } from '@jsonforms/vue-vuetify'

const controlRenderer = defineComponent({
    name: 'enum-array-renderer',
    components: {
        VCheckbox
    },
    props: {
        ...rendererProps<ControlElement>()
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
        }
    }
})

export default controlRenderer
</script>

<style scoped>
.checkbox-item {
    padding: 0 8px 0 12px;
}
</style>
