import { configureStore } from "@reduxjs/toolkit"
import menuSlice from "@/features/menus/menuSlice"

export const store = configureStore({
  reducer: {
    menus: menuSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
