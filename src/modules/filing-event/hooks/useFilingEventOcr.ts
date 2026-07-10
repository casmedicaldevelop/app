import { useMutation } from '@tanstack/react-query'
import { filingEventService } from '../services/filing-event.service'

export function useFilingEventOcr() {
  return useMutation({
    mutationFn: (file: File) => filingEventService.ocr(file),
  })
}
