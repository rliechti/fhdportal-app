import { rankWith, schemaMatches } from '@jsonforms/core'

export default rankWith(
  5,
  schemaMatches((schema) => {
    return (
      schema.type === 'string' &&
      schema["x-check"] !== undefined &&
      schema["x-check_title"] !== undefined &&
      schema["x-check_value"] !== undefined &&
      schema["x-check"] !== '' &&
      schema["x-check_title"] !== '' &&
      schema["x-check_value"] !== ''
    )
  }),
)
