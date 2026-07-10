import { apiFetch } from '../../../lib/api-fetch'
import type { CreateDoctorPayload, Doctor } from '../types/doctor.types'

export const doctorsService = {
  async list(search?: string): Promise<Doctor[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiFetch<Doctor[]>(`/doctors${qs}`)
  },

  async create(payload: CreateDoctorPayload): Promise<Doctor> {
    return apiFetch<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
