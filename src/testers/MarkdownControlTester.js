import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
    10,
    schemaMatches((schema) => {
        return schema['x-renderer'] === 'policy-attachment-markdown'
    })
)
