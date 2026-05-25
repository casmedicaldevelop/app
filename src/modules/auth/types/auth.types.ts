export type Role = 'ADMIN' | 'USER'

export interface UserModule {
  name: string
  label: string
  icon: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  mustChangePassword: boolean
  modules: UserModule[]
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: Omit<User, 'modules'>
}

export type MeResponse = User

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}

export interface VerifyOtpResponse {
  valid: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}
