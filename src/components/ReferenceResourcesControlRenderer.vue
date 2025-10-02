<template>
  <v-card v-if="control.visible" :class="styles.arrayList.root" elevation="0">
    <v-card-title>
      {{ cardTitle }} 
      <v-text-field
        label="filter..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        class="float-right"
        v-model="filter"
        width="350px"
        clearable
      ></v-text-field>
    </v-card-title>
    <v-card-text>
      <v-container justify-space-around align-content-center>
        <v-row justify="center">
          <v-table
            class="array-container flex"
            v-bind="vuetifyProps('v-table')"
            density="compact"
            :hover="true"
          >
            <thead>
              <tr>
                <th>
                  <v-checkbox
                    :model-value="checkAll"
                    :disabled="!control.enabled"
                    :indeterminate="control.data === undefined"
                    @update:model-value="toggleAll"
                  />
                </th>
                <th
                  v-for="(prop, index) in tableHeaders"
                  :key="`${control.path}-header-${index}`"
                  scope="col"
                >
                  {{ prop.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(resource, index) in visibleResources"
                :key="`${control.path}-${index}`"
              >
                <td>
                  <v-checkbox
                    :model-value="dataHasEnum(resource.public_id)"
                    :id="control.id + `-input-${index}`"
                    :path="composePaths(control.path, `${index}`)"
                    :disabled="!control.enabled"
                    :indeterminate="control.data === undefined"
                    v-bind="vuetifyProps(`v-checkbox[${resource.public_id}]`)"
                    @update:model-value="() => toggle(resource.public_id)"
                  />
                </td>
                <td
                  v-for="propName in tableHeaders"
                  :key="`${control.path}-${index}-${propName.value}`"
                >
                  <template v-if="resource[propName.value] !== undefined">
                    <template v-if="resource[propName.value] instanceof Array">
                      <v-chip size="small">
                        {{ resource[propName.value].length }}
                        <v-tooltip activator="parent" location="top">
                          <span
                            v-html="resource[propName.value].join('<br />')"
                        /></v-tooltip>
                      </v-chip>
                    </template>
                    <template v-else-if="propName.value === 'title'">
                      {{ resource[propName.value] }}
                      <v-chip
                        v-if="resource.public_id !== undefined"
                        variant="text"
                        class="text-info"
                        size="small"
                        @click="copy(resource.public_id)"
                      >
                        <v-icon icon="mdi-information"></v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ resource.public_id }}
                        </v-tooltip>
                      </v-chip>
                    </template>
                    <template
                      v-else-if="
                        resource[propName.value].indexOf('CHFEGA') > -1
                      "
                    >
                      <v-chip
                        v-if="resource.public_id !== undefined"
                        size="small"
                        @click="copy(resource[propName.value])"
                      >
                        {{ formatId(resource[propName.value]) }}
                        <v-tooltip activator="parent" location="top">
                          {{ resource[propName.value] }}
                        </v-tooltip>
                      </v-chip>
                    </template>
                    <template v-else-if="propName.value === 'creator_name'">
                      <v-chip color="blue" size="small">
                        {{ resource[propName.value].replace(/([^A-Z])/g, '').trim() }}
                        <v-tooltip activator="parent" location="top"
                          ><span v-html="resource[propName.value].replace(/([A-Z])/g, ' $1').trim()"
                        /></v-tooltip>
                      </v-chip>                      
                    </template>
                    <template v-else-if="propName.value === 'last_update'">
                      {{ formatDate(resource[propName.value]) }}
                    </template>
                    <template v-else>
                      {{ resource[propName.value] }}
                    </template>
                  </template>
                  <template v-else>
                    <template
                      v-if="
                        resource.properties[propName.value] instanceof Array
                      "
                    >
                      <v-chip size="small">
                        {{ resource.properties[propName.value].length }}
                        <v-tooltip activator="parent" location="top">
                          <span
                            v-html="
                              resource.properties[propName.value].join('<br />')
                            "
                          />
                        </v-tooltip>
                      </v-chip>
                    </template>
                    <template v-else-if="propName.value === 'title'">
                      {{ formatDate(resource.properties[propName.value]) }}
                    </template>
                    <template v-else-if="propName.value === 'last_update'">
                      {{ formatDate(resource.properties[propName.value]) }}
                    </template>
                    <template
                      v-else-if="
                        resource.properties[propName.value].indexOf('CHFEGA') >
                        -1
                      "
                    >
                      <v-chip
                        v-if="resource.public_id !== undefined"
                        size="small"
                        @click="copy(resource.properties[propName.value])"
                      >
                        {{ formatId(resource.properties[propName.value]) }}
                        <v-tooltip activator="parent" location="top">
                          {{ resource.properties[propName.value] }}
                        </v-tooltip>
                      </v-chip>
                    </template>

                    <template v-else>
                      {{ resource.properties[propName.value] }}
                    </template>
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {
  Resolve,
  composePaths,
  type ControlElement,
  type JsonSchema,
} from '@jsonforms/core'
import {
  rendererProps,
  useJsonFormsArrayControl,
  useJsonFormsMultiEnumControl,
  type RendererProps,
} from '@jsonforms/vue'
import { defineComponent } from 'vue'
import {
  VCard,
  VCardText,
  VCardTitle,
  VContainer,
  VRow,
  VTable,
  VTooltip,
  VCheckbox,
} from 'vuetify/components'
import {
  useVuetifyArrayControl,
  useVuetifyBasicControl,
} from '@jsonforms/vue-vuetify'
import useClipboard from 'vue-clipboard3'
import { useSubmissionStore } from '@/stores/submissions.js'
import { useAnalysisStore } from '@/stores/analyses.js'
import { useRunStore } from '@/stores/runs.js'
import { useSchemaStore } from '@/stores/schemas.js'
import { ref, onMounted } from 'vue'
import _ from 'lodash'
import moment from 'moment'
function containsString(obj, str) {
  if (_.isString(obj) && obj.toLowerCase().includes(str.toLowerCase())) return true;
  if (_.isArray(obj)) return obj.some(item => containsString(item, str));
  if (_.isObject(obj)) return _.some(obj, value => containsString(value, str));
  return false;
}
const controlRenderer = defineComponent({
  name: 'array-control-renderer',
  components: {
    VCard,
    VCardTitle,
    VCardText,
    VRow,
    VTooltip,
    VContainer,
    VTable,
    VCheckbox,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const defaultTableHeaders = [
      // {
      //   title: 'ID',
      //   value: 'public_id',
      // },
      {
        title: 'Last update',
        value: 'last_update',
      },
      {
        title: 'Created by',
        value: 'creator_name',
      },
    ]
    const filter = ref("")
    const tableHeaders = ref([])
    const checkAll = ref(false)
    const submissionStore = useSubmissionStore()
    const schemaStore = useSchemaStore()
    const study = submissionStore.study
    const input = ref(
      useVuetifyBasicControl(useJsonFormsMultiEnumControl(props)),
    )
    const resourceType = ref(input.value.control.schema['x-check'])
    // const resourceTypeTitle = ref((input.control.value.schema["x-check_title"] as string) || 'title')
    // const resourceTypeValue = ref((input.control.value.schema["x-check_value"] as string) || 'public_id')
    const resources = ref([])
    onMounted(() => {
      let resourceStore = {}
      let method = ''
      let resource_type = ''
      if (resourceType.value.match(/analys/i)) {
        resourceStore = useAnalysisStore()
        resource_type = 'analysis_type'
        method = 'getStudyAnalyses'
      } else if (resourceType.value.match(/run/i)) {
        resourceStore = useRunStore()
        resource_type = 'run_type'
        method = 'getStudyRuns'
      }
      let resourceTypes: string[] = []
      resourceStore[method]({ study_id: study.public_id })
        .then((data) => {
          resources.value = data
          _.forEach(resources.value, (e: any) => {
            if (resourceTypes.indexOf(e[resource_type]) === -1) {
              resourceTypes.push(e[resource_type])
            }
          })
          schemaStore.getSchemas().then((schemas) => {
            _.forEach(resourceTypes, (rT) => {
              if (schemas[rT] !== undefined) {
                if (schemas[rT].data_schema.required !== undefined) {
                  _.forEach(schemas[rT].data_schema.required, (d) => {
                    const header = {
                      value: d,
                      title: (d + '')
                        .replace(/_/g, ' ')
                        .replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                          return $1.toUpperCase()
                        }),
                    }
                    if (tableHeaders.value.indexOf(header) == -1) {
                      tableHeaders.value.push(header)
                    }
                  })
                }
              }
            })
            for (let i = 0; i < defaultTableHeaders.length; i++) {
              tableHeaders.value.push(defaultTableHeaders[i])
            }
          })
        })
        .catch((err) => console.log(err))
    })
    return {
      ...useVuetifyArrayControl(useJsonFormsArrayControl(props)),
      ...useVuetifyBasicControl(useJsonFormsMultiEnumControl(props)),
      resourceType,
      tableHeaders,
      checkAll,
      resources,
      filter
    }
  },
  computed: {
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
        this.control.rootSchema,
        this.control.uischema.scope,
        this.control.rootSchema,
      )
    },
    dataLength(): number {
      return this.resources ? this.resources.length : 0
    },
    cardTitle(): string {
      return this.control.schema !== undefined
        ? this.control.schema['x-check'].replace(/([A-Z])/g, ' $1').trim()
        : 'Resources'
    },
    resourceTypeTest() {
      return this.control.schema
    },
    visibleResources () {
      if (!this.filter){
        return this.resources
      }
      else{
        return _.filter(this.resources, r => {
          if (this.dataHasEnum(r.public_id)) return true
          return containsString(r,this.filter)
        })
      }
    }
  },
  methods: {
    dataHasEnum(value: any) {
      return !!this.control.data?.includes(value)
    },
    toggle(value: any) {
      if (!this.dataHasEnum(value)) {
        this.addItem(this.control.path, value)
      } else {
        // mistyped in core
        this.removeItem?.(this.control.path, value)
      }
    },
    formatDate(value) {
      return moment(value).format('DD.MM.YYYY')
    },
    formatId(value) {
      return value.substring(6, 7) + '0' + value.replace(/^CHFEGA.0+/, '')
    },
    toggleAll() {
      this.checkAll = !this.checkAll
      if (this.checkAll) {
        _.forEach(this.resources, (r) => {
          if (!this.dataHasEnum(r.public_id)) {
            this.addItem(this.control.path, r.public_id)
          }
        })
      } else {
        _.forEach(this.resources, (r) => {
          if (this.dataHasEnum(r.public_id)) {
            this.removeItem?.(this.control.path, r.public_id)
          }
        })
      }
    },
    async copy(msg) {
      const { toClipboard } = useClipboard()
      try {
        await toClipboard(msg)
        this.$notify({ type: 'success', text: 'Public ID copied to clipboard' })
      } catch (e) {
        console.error(e)
      }
    },

    composePaths,
  },
})

export default controlRenderer
</script>

<style scoped>
.fixed-cell {
  width: 150px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}

.fixed-cell-small {
  width: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}

.array-container {
  width: 100%;
}
.array-container tbody tr td {
  border-bottom: none !important;
}

.array-container tbody tr td .container {
  padding: 0;
  margin: 0;
}
</style>
