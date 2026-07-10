import { useQuery } from '@tanstack/react-query'
import { tvInsEventoService } from '../services/tvins-evento.service'

export function useMeasurementUnits() {
  return useQuery({
    queryKey: ['catalogs', 'measurement-units'],
    queryFn: () => tvInsEventoService.measurementUnits(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePharmaceuticalForms() {
  return useQuery({
    queryKey: ['catalogs', 'pharmaceutical-forms'],
    queryFn: () => tvInsEventoService.pharmaceuticalForms(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useScientificUnits() {
  return useQuery({
    queryKey: ['catalogs', 'scientific-units'],
    queryFn: () => tvInsEventoService.scientificUnits(),
    staleTime: 5 * 60 * 1000,
  })
}
