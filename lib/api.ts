import { CreateMenuInput, MenuItem, PaginationData, UpdateMenuInput } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface FilterParams {
  page?: number
  tree?: string
}

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  private buildQueryParams(params: FilterParams = {}): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    return searchParams.toString()
  }

  // Menus API
  async getMenus(params?: FilterParams): Promise<ApiResponse<PaginationData<MenuItem>>> {
    const query = this.buildQueryParams(params)
    return this.request<ApiResponse<PaginationData<MenuItem>>>(`/menus${query ? `?${query}` : ""}`)
  }

  async getMenuTree(): Promise<ApiResponse<MenuItem[]>> {
    return this.request<ApiResponse<MenuItem[]>>(`/menus/tree`)
  }

  async getMenuById(id: number, params?: FilterParams): Promise<ApiResponse<MenuItem>> {
    const query = this.buildQueryParams(params)
    return this.request<ApiResponse<MenuItem>>(`/menus/${id}${query ? `?${query}` : ""}`)
  }

  async createMenu(data: {
    name: string
    parentId?: number | null
    isActive: boolean
  }): Promise<ApiResponse<CreateMenuInput>> {
    return this.request<ApiResponse<MenuItem>>("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateMenu(
    id: number,
    data: {
      name?: string
      parentId?: number | null
      isActive?: boolean
    },
  ): Promise<ApiResponse<UpdateMenuInput>> {
    return this.request<ApiResponse<MenuItem>>(`/menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteMenu(id: number): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/menus/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
