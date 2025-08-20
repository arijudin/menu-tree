"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { deleteMenu, fetchMenuById, fetchMenus, fetchMenuTree, selectSelectedMenuId, setMenuTreeById, setSelectedMenuId } from "@/features/menus/menuSlice"
import * as React from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MenuItem } from "@/types"
import { TreeView } from "./tree-view"
import MenuForm from "./menu-form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function MenusPage() {
  const dispatch = useAppDispatch()
  const { menuTree, loading } = useAppSelector(
    (state) => state.menus,
  )
  const selectedMenuId = useAppSelector(selectSelectedMenuId)

  const [viewMenu, setViewMenu] = React.useState<MenuItem[]>([])
  const [selectedMenu, setSelectedMenu] = React.useState<MenuItem | null>(null)
  const [selectedParent, setSelectedParent] = React.useState<MenuItem | null>(null)
  const [state, setState] = React.useState<"add" | "update">("add")
  const [removedMenu, setRemovedMenu] = React.useState<MenuItem | null>(null)
  const [deleteAlert, setDeleteAlert] = React.useState<boolean>(false)

  const safeMenuTree = React.useMemo(() => menuTree || [], [menuTree])

  const handleViewMenu = async (menuId?: string) => {
    if (menuId) {
      const data = await dispatch(
        fetchMenuById({ id: Number(menuId), params: { tree: "true" } })
      ).unwrap()

      setViewMenu(data ? [data] : [])
    } else {
      setViewMenu([])
    }

    setSelectedMenu(null)
    setSelectedParent(null)
  }

  const handleAddMenu = (parent: MenuItem) => {
    setState("add")
    setSelectedMenu(null)
    setSelectedParent(parent)
  }

  const handleUpdateMenu = (menu: MenuItem) => {
    setState("update")
    setSelectedMenu(menu)
    setSelectedParent(null)
  }

  const handleDeleteMenu = (menu: MenuItem) => {
    setRemovedMenu(menu)
    setDeleteAlert(true)
  }

  const handleDeleteFn = async () => {
    if (!removedMenu) return
    try {
      const response = await dispatch(deleteMenu(removedMenu.id)).unwrap() as {
        success: boolean
        message: string
      }
      if (response.success) {
        toast.success(response.message)
        if (!removedMenu.depth) {
          setViewMenu([])
          dispatch(setSelectedMenuId(undefined))
        } else {
          handleRefreshTree()
        }
        dispatch(fetchMenuTree())
        setDeleteAlert(false)
      }
    } catch (err) {
      console.error("Failed to remove menu", err)
    }
  }

  const handleCancelForm = () => {
    setState("add")
    setSelectedMenu(null)
    setSelectedParent(null)
  }

  const handleFormSuccess = () => {
    setSelectedMenu(null)
    setSelectedParent(null)
    dispatch(fetchMenuTree())
    setState("add")
    handleRefreshTree()
  }

  const handleRefreshTree = async () => {
    const selectedViewMenu = viewMenu.length ? viewMenu[0] : null
    if (!selectedViewMenu) return

    try {
      const data = await dispatch(
        fetchMenuById({ id: selectedViewMenu.id, params: { tree: "true" } })
      ).unwrap()

      setViewMenu(data ? [data] : [])
    } catch (err) {
      console.error("Failed to refresh tree", err)
    }
  }

  React.useEffect(() => {
    if (!selectedMenuId) return
    const exists = safeMenuTree.some(m => m.id.toString() === selectedMenuId)
    if (!exists) {
      dispatch(setSelectedMenuId(undefined))
      setViewMenu([])
    }
  }, [dispatch, safeMenuTree, selectedMenuId])

  React.useEffect(() => {
    dispatch(fetchMenus({ page: 1 }))
    dispatch(fetchMenuTree())
  }, [dispatch])

  return (
    <div className="px-4 pb-5">
      <div className="py-4 space-x-4 inline-flex items-center">
        <div className="rounded-full bg-[#0051AF] w-[52px] h-[52px] items-center justify-center inline-flex">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3.65625" y="3.66992" width="6.69214" height="6.69336" rx="1" fill="white" />
            <rect x="3.65625" y="13.6523" width="6.69214" height="6.69336" rx="1" fill="white" />
            <rect x="13.6539" y="13.6523" width="6.69214" height="6.69336" rx="1" fill="white" />
            <circle cx="16.9871" cy="7.04102" r="3.69067" fill="white" />
          </svg>
        </div>
        <h4 className="text-[32px] font-bold">Menus</h4>
      </div>
      <div className="space-y-2">
        <Label htmlFor="terms" className="text-gray-600">Menu</Label>
        <div className="space-x-3 flex items-center">
          <Select
            key={selectedMenuId ?? "empty"}
            disabled={loading}
            value={selectedMenuId}
            onValueChange={(value) => {
              dispatch(setSelectedMenuId(value))
              handleViewMenu(value);
            }}
          >
            <SelectTrigger className="w-full md:max-w-[349px] !h-[52px] bg-[#F9FAFB] border-none rounded-2xl">
              {loading ? (
                <span className="text-gray-400 animate-pulse">Loading menus...</span>
              ) : (
                <SelectValue placeholder="Select a menu" />
              )}
            </SelectTrigger>
            {!loading && (
              <SelectContent>
                {!safeMenuTree.length ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-xs italic text-center">-- NONE --</div>
                ) : (
                  <SelectGroup>
                    <SelectLabel>Menus</SelectLabel>
                    {safeMenuTree.map((menu: MenuItem) => (
                      <SelectItem key={menu.id} value={menu.id.toString()} className="hover:cursor-pointer">
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            )}
          </Select>
          {selectedMenuId && (
            <Button
              variant="ghost"
              onClick={() => {
                dispatch(setMenuTreeById(null))
                dispatch(setSelectedMenuId(undefined))
                handleViewMenu(undefined)
              }}
              title="Clear selection"
              className="hover:cursor-pointer"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <TreeView
            data={viewMenu} defaultOpenIds={[1, 2]}
            onSelectAction={(m: MenuItem) => handleUpdateMenu(m)}
            onAddAction={(p: MenuItem) => handleAddMenu(p)}
            onDeleteAction={(m: MenuItem) => handleDeleteMenu(m)}
          />
          <div>
            <MenuForm
              menu={selectedParent || selectedMenu}
              onSuccess={handleFormSuccess}
              onCancel={() => handleCancelForm()}
              state={state}
            />
          </div>
        </div>
      </div>
      <AlertDialog open={deleteAlert} onOpenChange={() => setRemovedMenu(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu
              and remove data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="hover:cursor-pointer"
              onClick={() => setDeleteAlert(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-50 text-red-500 hover:bg-red-100 hover:cursor-pointer"
              onClick={() => handleDeleteFn()}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
