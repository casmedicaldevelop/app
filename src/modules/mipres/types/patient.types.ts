import type {
  DocumentType,
  Gender,
  HealthcareRegime,
} from '../../users/types/service-user.types'

export type BirthDateMode = 'exact' | 'age'

export interface RegisterPatientFormValues {
  documentType: DocumentType | ''
  gender: Gender | ''
  firstName: string
  secondName: string
  firstSurname: string
  secondSurname: string
  phone: string
  email: string
  birthMode: BirthDateMode
  birthDate?: string
  age?: number
  healthcareRegime: HealthcareRegime | ''
  city: string
  neighborhood: string
  address: string
  description: string
}
