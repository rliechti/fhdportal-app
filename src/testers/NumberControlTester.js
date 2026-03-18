import { rankWith, isNumberControl, isIntegerControl, or } from '@jsonforms/core'

export default rankWith(2, or(isNumberControl, isIntegerControl))
