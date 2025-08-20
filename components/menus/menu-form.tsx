"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import type { MenuItem } from "@/types"
import { menusData } from "@/features/menus/menuSlice"
import { useAppSelector } from "@/store/hooks"

type MenuFormData = {
  uid: string
  parentId: number | null
  parentName: string
  depth?: number | null
  name: string
  isActive: boolean
}

interface MenuFormProps {
  menu: MenuItem | null
  state: "add" | "update"
  onSuccess: () => void
  onCancel: () => void
}

const findMenuById = (nodes: MenuItem[], id: number): MenuItem | null => {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children?.length) {
      const f = findMenuById(n.children, id)
      if (f) return f
    }
  }
  return null
}

export default function MenuForm({ menu, state, onSuccess, onCancel }: MenuFormProps) {
  const menus = useAppSelector(menusData)

  const [formData, setFormData] = React.useState<MenuFormData>({
    uid: "",
    parentId: null,
    // depth: null,
    parentName: "",
    name: "",
    isActive: true,
  })
  const [loading, setLoading] = React.useState(false)
  const [isInitializing, setIsInitializing] = React.useState(false)

  const handleResetForm = () => {
    setFormData({
      uid: "",
      parentId: null,
      // depth: null,
      parentName: "",
      name: "",
      isActive: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newFormData = {
      name: formData.name,
      isActive: formData.isActive,
      parentId: formData.parentId ? formData.parentId : null
    }

    let response: { success: boolean; data?: MenuItem; message?: string }
    try {
      if (menu?.id && state === "update") {
        response = (await apiClient.updateMenu(menu.id, newFormData)) as {
          success: boolean
          data?: MenuItem
          message?: string
        }
      } else {
        response = (await apiClient.createMenu(newFormData)) as { success: boolean; data?: MenuItem; message?: string }
      }

      if (response.success) {
        const message = menu?.id && state === "update" ? "Menu updated successfully" : "Menu created successfully"
        toast.success(message)
        onSuccess()
        handleResetForm()
      }
    } catch (error) {
      const message = menu?.id && state === "update" ? "Failed to update menu" : "Failed to create menu"
      toast.error(message)
      if (process.env.NODE_ENV == "development") {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (isInitializing) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const onCancelForm = () => {
    handleResetForm()
    onCancel()
  }

  React.useEffect(() => {
    setIsInitializing(true)
    try {
      if (!menu) {
        handleResetForm()
        return
      }

      const parentId =
        (menu as MenuItem).parentId ?? (menu as MenuItem).parentId ?? null

      if (!parentId) {
        setFormData(prev => ({
          ...prev,
          uid: menu.uid ?? prev.uid,
          depth: menu.depth,
          parentId: null,
          parentName: state === "update" ? "" : menu.name,
          name: state === "update" ? menu.name ?? prev.name : "",
          isActive: menu.isActive ?? prev.isActive,
        }))
        return
      }

      const parent = Array.isArray(menus) ? findMenuById(menus, Number(parentId)) : null

      setFormData(prev => ({
        ...prev,
        uid: menu.uid ?? prev.uid,
        depth: menu.depth,
        parentId: state === "update" ? menu.parentId : menu.id,
        parentName: state === "update" ? parent?.name ?? "" : menu.name,
        name: state === "update" ? menu.name ?? prev.name : "",
        isActive: menu.isActive ?? prev.isActive,
      }))
    } finally {
      setIsInitializing(false)
    }

  }, [menu, state, menus])

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full md:max-w-[532px] mt-10 md:mt-0">
      <div className="grid grid-cols-1 gap-4">
        <h4 className="font-semibold text-xl text-gray-600">
          {
            state === "add" && formData.parentId ? "Create Menu Children" :
              state === "add" && !formData.parentId ? "Create Menu" :
                "Update Menu"
          }
        </h4>
        <div className="space-y-2">
          <Label htmlFor="uid" className="text-[#475467]">Menu ID</Label>
          <Input
            id="uid"
            value={formData.uid}
            className="bg-[#F9FAFB] border-0 shadow-none h-[52px] rounded-2xl !text-base disabled:bg-[#EAECF0]"
            disabled
          />
        </div>
        <div className="space-y-2 md:max-w-1/2">
          <Label htmlFor="depth" className="text-[#475467]">Depth</Label>
          <Input
            id="depth"
            value={formData.depth || "0"}
            className="bg-[#F9FAFB] border-0 shadow-none h-[52px] rounded-2xl !text-base disabled:bg-[#EAECF0]"
            disabled
          />
        </div>
        <div className="space-y-2 md:max-w-1/2">
          <Label htmlFor="parentName" className="text-[#475467]">Parent Data</Label>
          <Input
            id="parentName"
            value={formData.parentName || ""}
            className="bg-[#F9FAFB] border-0 shadow-none h-[52px] rounded-2xl !text-base disabled:bg-[#EAECF0]"
            disabled
          />
        </div>
        <div className="space-y-2 md:max-w-1/2">
          <Label htmlFor="name" className="text-[#475467]">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="bg-[#F9FAFB] border-0 shadow-none h-[52px] rounded-2xl !text-base disabled:bg-[#EAECF0]"
            required
          />
        </div>
        <div className="space-y-2 md:max-w-1/2">
          <Label htmlFor="isActive" className="flex items-center gap-2 text-[#475467]">
            Is Active
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancelForm} className="hover:cursor-pointer rounded-4xl h-12 px-8 md:px-10">
          Cancel
        </Button>
        <Button type="submit" className="hover:cursor-pointer bg-[#0051AF] text-white hover:bg-[#0041AF] rounded-4xl h-12 px-12 md:px-10" disabled={loading}>
          {loading ? "Saving..." : state === "add" ? "Save" : "Update"}
        </Button>
      </div>
    </form>
  )
}
