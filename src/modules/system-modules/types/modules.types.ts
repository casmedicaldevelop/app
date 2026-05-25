export interface SystemModule {
  id: string
  name: string
  label: string
  icon: string
  description: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  assignedUsersCount: number
}

export interface CreateModulePayload {
  name: string
  label: string
  icon: string
  description?: string
}

export interface UpdateModulePayload {
  label?: string
  icon?: string
  description?: string | null
  isActive?: boolean
}

export interface ReorderModulesPayload {
  order: string[]
}
