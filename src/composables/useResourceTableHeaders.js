import { ref } from 'vue'
import _ from 'lodash'
import { useSchemaStore } from '@/stores/schemas.js'
import { fitColumn, flexColumn } from '@/utils/dataTableHeaders'
import { titleCaseFromSnake } from '@/utils/format'

export function useResourceTableHeaders({
    source,
    isDescription = () => false,
    defaultHeaders = []
}) {
    const headers = ref([])

    function extractFields(schema) {
        if (source === 'data_schema.required') {
            return (schema.data_schema?.required ?? []).map((value) => ({ value, label: value }))
        }
        return (schema.ui_schema?.displayedElements ?? []).map((path) => ({
            value: path,
            label: path.split('.').pop()
        }))
    }

    async function build(items, typeKey) {
        const idHeader = fitColumn({
            title: 'ID',
            value: 'public_id',
            align: 'center',
            sortable: true,
            headerProps: { class: 'fega-table-cell-compact' },
            cellProps: { class: 'fega-table-cell-compact' }
        })

        const types = _.uniq(_.map(items, typeKey)).filter(Boolean)
        const schemas = await useSchemaStore().getSchemas()

        const built = [idHeader]
        const seen = new Set()
        types.forEach((type) => {
            const schema = schemas[type]
            if (!schema) return
            extractFields(schema).forEach(({ value, label }) => {
                if (seen.has(value)) return
                seen.add(value)
                const described = isDescription(label)
                built.push(
                    value === 'title'
                        ? flexColumn({ value, title: titleCaseFromSnake(label), sortable: true })
                        : fitColumn({
                              value,
                              title: described ? 'Description' : titleCaseFromSnake(label),
                              sortable: true
                          })
                )
            })
        })

        headers.value = [...built, ...defaultHeaders]
    }

    return { headers, build }
}
