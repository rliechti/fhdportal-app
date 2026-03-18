import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
    10,
    schemaMatches((schema) => {
        return (
            schema.type === 'array' &&
            schema['x-check'] !== undefined &&
            schema['x-compact'] === true
        )
    })
)
