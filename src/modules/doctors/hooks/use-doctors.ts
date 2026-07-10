import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { doctorsService } from '../services/doctors.service'
import type { CreateDoctorPayload, Doctor } from '../types/doctor.types'

const DOCTORS_QUERY_KEY = ['doctors'] as const

export function useDoctorsList(search: string) {
  return useQuery<Doctor[]>({
    queryKey: [...DOCTORS_QUERY_KEY, search.trim().toLowerCase()],
    queryFn: () => doctorsService.list(search.trim() || undefined),
    staleTime: 30_000,
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation<Doctor, Error, CreateDoctorPayload>({
    mutationFn: (payload) => doctorsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY })
    },
  })
}
