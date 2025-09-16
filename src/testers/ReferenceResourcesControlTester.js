import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
  5,
  schemaMatches((schema) => {
    return schema.type === 'array' && schema["x-check"] !== undefined
  }),
)
