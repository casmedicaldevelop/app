import { useQuery } from '@tanstack/react-query'
import { tvMedEventoService } from '../services/tvmed-evento.service'

export function useMeasurementUnits() {
  return useQuery({
    queryKey: ['catalogs', 'measurement-units'],
    queryFn: () => tvMedEventoService.measurementUnits(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePharmaceuticalForms() {
  return useQuery({
    queryKey: ['catalogs', 'pharmaceutical-forms'],
    queryFn: () => tvMedEventoService.pharmaceuticalForms(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useScientificUnits() {
  return useQuery({
    queryKey: ['catalogs', 'scientific-units'],
    queryFn: () => tvMedEventoService.scientificUnits(),
    staleTime: 5 * 60 * 1000,
  })
}
