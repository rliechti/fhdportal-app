import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
  5,
  schemaMatches((schema) => {
    return (schema.type === 'integer' || schema.type === 'number')  && schema["x-check"] === 'pubmed_id'
  }),
)
