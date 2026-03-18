<template>
    <control-wrapper
        v-bind="controlWrapper"
        :styles="styles"
        :isFocused="isFocused"
        :appliedOptions="appliedOptions"
    >
        <v-text-field
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
            :model-value="inputValue"
            :clearable="control.enabled"
            inputmode="numeric"
            v-bind="vuetifyProps('v-text-field')"
            @update:model-value="onInputChange"
            @focus="handleFocus"
            @blur="onBlur"
        />
    </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { defineComponent, ref } from 'vue'
import { VTextField } from 'vuetify/components'
import { useVuetifyControl, ControlWrapper, DisabledIconFocus } from '@jsonforms/vue-vuetify'

const controlRenderer = defineComponent({
    name: 'number-control-renderer',
    components: { ControlWrapper, VTextField },
    directives: { DisabledIconFocus },
    props: { ...rendererProps<ControlElement>() },
    setup(props: RendererProps<ControlElement>) {
        const adaptValue = (value: any) =>
            value === null || value === undefined ? undefined : value
        const input = useVuetifyControl(useJsonFormsControl(props), adaptValue)
        const inputValue = ref(
            input.control.value.data !== undefined && input.control.value.data !== null
                ? String(input.control.value.data)
                : ''
        )
        return { ...input, inputValue }
    },
    computed: {
        isInteger(): boolean {
            return this.control.schema.type === 'integer'
        }
    },
    watch: {
        'control.data'(newVal) {
            const strVal = newVal !== undefined && newVal !== null ? String(newVal) : ''
            if (strVal !== this.inputValue) {
                this.inputValue = strVal
            }
        }
    },
    methods: {
        filterInput(raw: string): string {
            let result = ''
            let hasDecimal = false
            for (let i = 0; i < raw.length; i++) {
                const c = raw[i]
                if (c === '-' && i === 0) {
                    result += c
                } else if (c === '.' && !this.isInteger && !hasDecimal) {
                    result += c
                    hasDecimal = true
                } else if (/\d/.test(c)) {
                    result += c
                }
            }
            return result
        },
        onInputChange(raw: string | null | undefined) {
            const filtered = this.filterInput(raw ?? '')
            this.inputValue = filtered
            if (filtered === '') {
                this.onChange(undefined)
                return
            }
            if (this.isInteger) {
                const n = parseInt(filtered, 10)
                if (!isNaN(n)) this.onChange(n)
            } else {
                if (filtered === '-' || filtered.endsWith('.')) return
                const n = parseFloat(filtered)
                if (!isNaN(n)) this.onChange(n)
            }
        },
        onBlur() {
            this.handleBlur()
            if (this.inputValue === '' || this.inputValue === '-') {
                this.inputValue = ''
                this.onChange(undefined)
                return
            }
            if (this.isInteger) {
                const n = parseInt(this.inputValue, 10)
                if (!isNaN(n)) {
                    this.inputValue = String(n)
                    this.onChange(n)
                }
            } else if (this.inputValue.endsWith('.')) {
                const n = parseFloat(this.inputValue)
                if (!isNaN(n)) {
                    this.inputValue = String(n)
                    this.onChange(n)
                }
            }
        }
    }
})

export default controlRenderer
</script>
