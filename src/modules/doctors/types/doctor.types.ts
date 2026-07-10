export interface Doctor {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateDoctorPayload {
  id: string
  name: string
}
