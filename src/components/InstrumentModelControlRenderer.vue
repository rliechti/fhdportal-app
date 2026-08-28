<template>
    <control-wrapper
        v-bind="controlWrapper"
        :styles="styles"
        :isFocused="isFocused"
        :appliedOptions="appliedOptions"
    >
        <div class="d-flex align-start ga-3">
            <v-select
                label="Manufacturer"
                style="min-width: 0; flex: 0 0 38%"
                :class="styles.control.input"
                :items="manufacturers"
                :model-value="selectedManufacturer"
                :disabled="!control.enabled"
                :clearable="control.enabled"
                hide-details
                v-bind="vuetifyProps('v-select')"
                @update:model-value="onManufacturerChange"
            />
            <v-select
                :label="computedLabel"
                style="min-width: 0; flex: 1"
                :class="styles.control.input"
                :items="filteredModels"
                :model-value="selectedModel"
                :disabled="!control.enabled || !selectedManufacturer"
                :clearable="control.enabled"
                :hint="control.description"
                :persistent-hint="persistentHint()"
                :error-messages="control.errors ? [control.errors] : []"
                :required="control.required"
                v-bind="vuetifyProps('v-select')"
                @update:model-value="onModelChange"
            />
        </div>
    </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { VSelect } from 'vuetify/components'
import { useVuetifyControl, ControlWrapper } from '@jsonforms/vue-vuetify'

const controlRenderer = defineComponent({
    name: 'instrument-model-control-renderer',
    components: { ControlWrapper, VSelect },
    props: {
        ...rendererProps<ControlElement>()
    },
    setup(props: RendererProps<ControlElement>) {
        const jsonControl = useJsonFormsControl(props)
        const { control, handleChange } = jsonControl
        const vuetifyInput = useVuetifyControl(jsonControl, (v: any) => v || undefined)

        // Parse enum values into { MANUFACTURER: [model1, model2, ...] }
        const grouped = computed<Record<string, string[]>>(() => {
            const enumValues = (control.value.schema?.enum as string[]) || []
            const result: Record<string, string[]> = {}
            for (const entry of enumValues) {
                const colonIdx = entry.indexOf(': ')
                if (colonIdx === -1) continue
                const manufacturer = entry.substring(0, colonIdx)
                const model = entry.substring(colonIdx + 2)
                if (!result[manufacturer]) result[manufacturer] = []
                result[manufacturer].push(model)
            }
            return result
        })

        const manufacturers = computed<string[]>(() => Object.keys(grouped.value))

        const parseValue = (value: string | undefined): { manufacturer: string; model: string } => {
            if (!value) return { manufacturer: '', model: '' }
            const colonIdx = value.indexOf(': ')
            if (colonIdx === -1) return { manufacturer: '', model: '' }
            return {
                manufacturer: value.substring(0, colonIdx),
                model: value.substring(colonIdx + 2)
            }
        }

        const initial = parseValue(control.value.data as string | undefined)
        const selectedManufacturer = ref<string>(initial.manufacturer)
        const selectedModel = ref<string>(initial.model)

        // Keep dropdowns in sync with external data changes (e.g., editing an existing record)
        watch(
            () => control.value.data as string | undefined,
            (newVal) => {
                const parsed = parseValue(newVal)
                if (parsed.manufacturer !== selectedManufacturer.value) {
                    selectedManufacturer.value = parsed.manufacturer
                }
                if (parsed.model !== selectedModel.value) {
                    selectedModel.value = parsed.model
                }
            }
        )

        const filteredModels = computed<string[]>(() => {
            if (!selectedManufacturer.value) return []
            return grouped.value[selectedManufacturer.value] || []
        })

        const onManufacturerChange = (manufacturer: string | null) => {
            selectedManufacturer.value = manufacturer || ''
            selectedModel.value = ''
            handleChange(control.value.path, undefined)
        }

        const onModelChange = (model: string | null) => {
            selectedModel.value = model || ''
            if (selectedManufacturer.value && model) {
                handleChange(control.value.path, `${selectedManufacturer.value}: ${model}`)
            } else {
                handleChange(control.value.path, undefined)
            }
        }

        return {
            ...vuetifyInput,
            control,
            manufacturers,
            filteredModels,
            selectedManufacturer,
            selectedModel,
            onManufacturerChange,
            onModelChange
        }
    }
})

export default controlRenderer
</script>
