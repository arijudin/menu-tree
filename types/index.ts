export interface MenuItem {
  id: number
  uid: string
  name: string
  slug: string
  order: number
  isActive: boolean
  parentId: number
  depth: number
  children: MenuItem[]
  parent: MenuItem[]
  createdAt: string
  updatedAt: string
}

export type CreateMenuInput = {
  name: string
  parentId?: number | null
  isActive: boolean
  order?: number
}

export type UpdateMenuInput = Partial<CreateMenuInput>

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface DatabaseQueryResult {
  insertId: number
  affectedRows: number
  changedRows: number
  fieldCount: number
  info: string
  serverStatus: number
  warningStatus: number
}

export interface DatabaseCountResult {
  total: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationData<T> {
  data?: T[]
  items?: T[]
  pagination: PaginationInfo
}
