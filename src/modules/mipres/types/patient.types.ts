import type { HealthcareRegime } from '../../users/types/service-user.types'

export type BirthDateMode = 'exact' | 'age'

export interface RegisterPatientFormValues {
  firstName: string
  secondName?: string
  firstSurname: string
  secondSurname?: string
  phone: string
  email?: string
  birthMode: BirthDateMode
  birthDate?: string
  age?: number
  healthcareRegime?: HealthcareRegime | ''
  city?: string
  address?: string
}
