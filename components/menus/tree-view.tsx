"use client"

import * as React from "react"
import { ChevronRight, Plus, Trash } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { MenuItem } from "@/types"
import { Button } from "@/components/ui/button"

type TreeViewProps = {
  data: MenuItem[]
  className?: string
  onSelectAction?: (node: MenuItem) => void
  onAddAction?: (parent: MenuItem) => void
  onDeleteAction?: (node: MenuItem) => void
  defaultOpenIds?: Array<MenuItem["id"]>
}

export function TreeView({
  data,
  className,
  onSelectAction,
  onAddAction,
  onDeleteAction,
  defaultOpenIds = [],
}: TreeViewProps) {
  const [openIds, setOpenIds] = React.useState<number[]>(defaultOpenIds)

  const collectAllIds = React.useCallback((nodes: MenuItem[]): number[] => {
    let ids: number[] = []
    for (const n of nodes) {
      ids.push(n.id)
      if (n.children?.length) {
        ids = ids.concat(collectAllIds(n.children))
      }
    }
    return ids
  }, [])

  const handleExpandAll = () => {
    setOpenIds(collectAllIds(data))
  }

  const handleCollapseAll = () => {
    setOpenIds([])
  }

  const handleToggle = (id: number, open: boolean) => {
    setOpenIds((prev) =>
      open ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  return (
    <div className={cn("overflow-hidden", data.length ? "py-5 h-auto" : "h-0")}>
      <div className="space-x-2 mb-6">
        <Button
          variant="secondary"
          onClick={handleExpandAll}
          className="rounded-2xl font-medium bg-[#1D2939] text-blue-50 hover:text-[#1D2939] cursor-pointer px-8"
        >
          Expand All
        </Button>
        <Button
          variant="outline"
          onClick={handleCollapseAll}
          className="rounded-2xl font-medium cursor-pointer px-8"
        >
          Collapse All
        </Button>
      </div>
      <div className="clt">
        <ul className={cn("text-sm text-gray-800 !pl-0 space-y-3", className)}>
          {data.map((n, i) => (
            <TreeItem
              key={n.id}
              node={n as MenuItem}
              level={0}
              index={i}
              onSelectAction={onSelectAction}
              onAddAction={onAddAction}
              onDeleteAction={onDeleteAction}
              defaultOpenIds={defaultOpenIds}
              openIds={openIds}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

type TreeItemProps = {
  node: MenuItem
  level: number
  index: number
  onSelectAction?: (node: MenuItem) => void
  onAddAction?: (parent: MenuItem) => void
  onDeleteAction?: (node: MenuItem) => void
  defaultOpenIds: Array<MenuItem["id"]>
  openIds: number[]
  onToggle: (id: number, open: boolean) => void
}

function TreeItem({
  node,
  level,
  index,
  onSelectAction,
  onAddAction,
  onDeleteAction,
  defaultOpenIds,
  openIds,
  onToggle,
}: TreeItemProps) {
  const hasChildren = !!node.children?.length
  const isOpen = openIds.includes(node.id)

  return (
    <li
      className="relative"
      data-level={level}
      data-root-first={level === 0 && index === 0 ? "true" : "false"}
    >
      <div className="flex pt-1.5">
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={(v) => onToggle(node.id, v)} className="w-full">
            <CollapsibleTrigger asChild>
              <div
                className="group flex w-full items-center gap-2 rounded-md px-1 hover:bg-gray-50 h-[26px]"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform hover:cursor-pointer hover:text-blue-500",
                    isOpen && "rotate-90"
                  )}
                />
                <span
                  className="truncate text-gray-900 hover:cursor-pointer hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectAction?.(node)
                  }}
                  title="Edit menu"
                >
                  {node.name}
                </span>

                {onAddAction && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddAction(node)
                    }}
                    className="ml-auto inline-flex md:hidden items-center justify-center rounded-full p-1 bg-[#0051AF] md:bg-transparent text-white md:text-[#0051AF] hover:bg-[#0051AF] hover:text-white group-hover:inline-flex hover:size-[26px] hover:cursor-pointer"
                    title="Add child"
                  >
                    <Plus className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent asChild>
              <ul className="ml-3">
                {node.children!.map((c, i) => (
                  <TreeItem
                    key={c.id}
                    node={c}
                    level={level + 1}
                    index={i}
                    onSelectAction={onSelectAction}
                    onAddAction={onAddAction}
                    defaultOpenIds={defaultOpenIds}
                    openIds={openIds}
                    onToggle={onToggle}
                    onDeleteAction={onDeleteAction}
                  />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div
            className="group flex w-full items-center gap-2 rounded-md px-1 hover:bg-gray-50 h-[26px] hover:cursor-pointer truncate text-gray-900 hover:text-[#0051AF]"
            onClick={() => onSelectAction?.(node)}
            title="Edit menu"
          >
            <span className="truncate pl-1">{node.name}</span>

            <div className="ml-auto space-x-1">
              {onDeleteAction && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteAction(node)
                  }}
                  className="inline-flex md:hidden items-center justify-center rounded-full p-1 text-red-600 hover:bg-red-500 hover:text-white group-hover:inline-flex hover:cursor-pointer"
                  title="Add child"
                >
                  <Trash className="h-4 w-4" />
                </div>
              )}
              {onAddAction && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddAction(node)
                  }}
                  className="inline-flex md:hidden items-center justify-center rounded-full p-1 bg-[#0051AF] md:bg-transparent text-white md:text-[#0051AF] hover:bg-[#0051AF] hover:text-white group-hover:inline-flex hover:cursor-pointer"
                  title="Add child"
                >
                  <Plus className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </li >
  )
}
