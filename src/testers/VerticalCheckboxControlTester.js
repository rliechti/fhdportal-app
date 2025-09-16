import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
  15,
  schemaMatches((schema) => {
    return schema.type === 'array' && schema["x-check"] === 'verticalcheckbox'
  }),
)
