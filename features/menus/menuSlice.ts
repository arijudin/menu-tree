import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api"
import type { MenuItem } from "@/types"

interface MenusState {
  menus: MenuItem[]
  menuTree: MenuItem[]
  menuTreeById: MenuItem | null
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  limit?: number
  selectedMenuId?: string
}

const initialState: MenusState = {
  menus: [],
  menuTree: [],
  menuTreeById: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  limit: 20,
  selectedMenuId: undefined,
}

function containsId(node: MenuItem, targetId: number): boolean {
  if (!node) return false
  if (node.id === targetId) return true
  return (node.children ?? []).some((c) => containsId(c, targetId))
}

export const fetchMenus = createAsyncThunk(
  "menus/fetchMenus",
  async (params: { page?: number }) => {
    const { page = 1 } = params
    const response = await apiClient.getMenus({ page })

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch menus")
    }

    return response.data
  },
)

export const fetchMenuTree = createAsyncThunk(
  "menus/fetchMenuTree",
  async () => {
    const response = await apiClient.getMenuTree()

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch menu tree")
    }
    return response.data
  },
)

export const fetchMenuById = createAsyncThunk<
  MenuItem,
  { id: number; params?: { tree?: string } }
>(
  "menus/fetchMenuById",
  async ({ id, params }: { id: number, params?: { tree?: string } }) => {
    const { tree = "true" } = params ?? {}
    const response = await apiClient.getMenuById(id, { tree })

    if (!response.success || !response.data) {
      throw new Error("Failed to fetch menu tree")
    }
    return response.data
  },
)

export const deleteMenu = createAsyncThunk("menus/deleteMenu", async (menuId: number) => {
  const response = await apiClient.deleteMenu(menuId)
  if (!response.success) {
    throw new Error("Failed to delete menu")
  }
  return { id: menuId, success: response.success, message: response.message }
})

const menuSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    setSelectedMenuId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedMenuId = action.payload
    },
    setMenuTreeById: (state, action: PayloadAction<MenuItem | null>) => {
      state.menuTreeById = action.payload
    },
    clearFilters: (state) => {
      state.currentPage = 1
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.limit = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false
        state.menus = action.payload.items || []
        state.total = action.payload.pagination.total
        state.totalPages = action.payload.pagination.totalPages
        state.currentPage = action.payload.pagination.page
        state.limit = action.payload.pagination.limit
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch menus"
      })

      .addCase(fetchMenuTree.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuTree.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.loading = false
        state.menuTree = action.payload || []
      })
      .addCase(fetchMenuTree.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch menu tree"
      })

      .addCase(fetchMenuById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuById.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.loading = false
        state.menuTreeById = action.payload
      })
      .addCase(fetchMenuById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch menu tree by id"
        state.menuTreeById = null
      })

      .addCase(deleteMenu.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        const { id } = action.payload

        state.menus = state.menus.filter((m) => m.id !== id)
        if (state.menuTreeById && containsId(state.menuTreeById, id)) {
          state.menuTreeById = null
        }
        if (state.selectedMenuId === String(id)) {
          state.selectedMenuId = undefined
        }
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Failed to delete menu"
      })
  },
})

export const { setSelectedMenuId, clearFilters, setCurrentPage, setPageSize, setMenuTreeById } = menuSlice.actions
export default menuSlice.reducer

export const selectSelectedMenuId = (s: { menus: MenusState }) => s.menus.selectedMenuId
export const selectMenuTreeById = (s: { menus: MenusState }) => s.menus.menuTreeById
export const menusData = (s: { menus: MenusState }) => s.menus.menus
