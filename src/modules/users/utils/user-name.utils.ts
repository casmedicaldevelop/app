import type { ServiceUser } from '../types/service-user.types'

export function composeFullName(
  u: Pick<ServiceUser, 'firstName' | 'secondName' | 'firstSurname' | 'secondSurname'>
): string {
  return [u.firstName, u.secondName, u.firstSurname, u.secondSurname]
    .filter(Boolean)
    .join(' ')
}
