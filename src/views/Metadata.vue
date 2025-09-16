<template>
  <div class="Metadata maxWidth">
    <v-sheet min-height="70vh" rounded="lg">
      <v-container style="position: relative">
        <h1 class="text-center">Metadata</h1>
        <v-card min-height="70vh" elevation="0">
          <v-card-text>
            <v-row>
              <v-col cols="3">
                <v-toolbar color="light">
                  <v-toolbar-title>List of Resources</v-toolbar-title>
                </v-toolbar>
                <v-list>
                  <!-- <v-list-subheader>List of Resources</v-list-subheader> -->
                  <v-list-item
                    v-for="(resourceSchemas, resourceType) in visibleSchemas"
                    :key="`nav${resourceType}`"
                    link
                    :title="resourceType"
                    :active="resourceType === activeResource"
                    @click="activeResource = resourceType"
                  ></v-list-item>
                </v-list>
              </v-col>
              <v-col>
                <v-tabs v-model="activeSchema">
                  <v-tab value="data_schema">data_schema</v-tab>
                  <v-tab value="ui_schema">ui_schema</v-tab>
                </v-tabs>
                <template
                  v-if="
                    activeResource &&
                    activeSchema &&
                    schemas[activeResource] !== undefined &&
                    schemas[activeResource][activeSchema] !== undefined
                  "
                >
                  <h2 class="my-3 w-100">
                    {{ activeResource }}
                    <v-btn variant="flat" class="float-right" @click="copy"
                      ><v-icon icon="mdi-clipboard" /><v-tooltip
                        activator="parent"
                        location="bottom"
                        >copy to clipboard</v-tooltip
                      ></v-btn
                    >
                  </h2>
                  <perfect-scrollbar style="height: calc(100vh - 360px)">
                  <vue-json-pretty
                    :show-line-number="true"
                    :show-line="false"
                    :data="schemas[activeResource][activeSchema]"
                  />
                  </perfect-scrollbar>
                </template>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useSchemaStore } from '@/stores/schemas.js'
import { mapState } from 'pinia'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import _ from 'lodash'
export default defineComponent({
  name: 'MetadataView',
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      activeResource: 'Study',
      activeSchema: 'data_schema',
    }
  },
  methods: {
    async copy() {
      const { toClipboard } = useClipboard()
      const json = JSON.stringify(
        this.schemas[this.activeResource][this.activeSchema],
      )
      try {
        await toClipboard(json)
        this.$notify({ type: 'success', text: 'Copied to clipboard' })
      } catch (e) {
        console.error(e)
      }
    },
  },
  computed: {
    ...mapState(useSchemaStore, ['schemas']),
    visibleSchemas() {
      let schemas = {}
      _.forEach(this.schemas, (s, rT) => {
        if (!_.isEmpty(s.ui_schema)) {
          schemas[rT] = s
        }
      })
      return schemas
    },
  },
  mounted() {
    const schemaStore = useSchemaStore()
    schemaStore.getSchemas()
  },
})
</script>
