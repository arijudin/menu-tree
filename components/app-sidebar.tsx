"use client"

import * as React from "react"
import { MdOutlineFolder } from "react-icons/md"
import { MdFolder } from "react-icons/md"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"
import { selectMenuTreeById } from "@/features/menus/menuSlice"
import { MenuItem } from "@/types"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const subtree = useAppSelector(selectMenuTreeById)

  return (
    <Sidebar variant="floating" {...props}>
      <div className="bg-[#0051AF] text-white font-medium md:rounded-3xl h-full">
        <SidebarHeader className="py-5 mt-2.5">
          <div className="flex justify-between items-center gap-3 px-6">
            <a href="#">
              <Image alt="Logo Solusi Teknologi Kreatif" className="flex-none" width={70} height={16} src={"/logo sementara 4.png"} />
            </a>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-2.5">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {subtree?.children.map((item, index) => (
                  <Tree key={index} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </div>
    </Sidebar >
  )
}

function Tree({ item, index = 0, level = 1 }: { item: MenuItem, index?: number, level?: number }) {
  const { name, children } = item

  if (!children.length) {
    return (
      <SidebarMenuButton
        className="data-[active=true]:bg-transparent rounded-2xl pl-3 pr-0 h-12 group/button font-bold"
      >
        <svg className="flex-none !size-6 block group-hover/button:hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.65625" y="3.66992" width="6.69214" height="6.69336" rx="1" stroke="white" />
          <rect x="3.65625" y="13.6523" width="6.69214" height="6.69336" rx="1" stroke="white" />
          <rect x="13.6539" y="13.6523" width="6.69214" height="6.69336" rx="1" stroke="white" />
          <circle cx="16.9871" cy="7.04102" r="3.69067" stroke="white" />
        </svg>
        <svg className="flex-none !size-6 hidden group-hover/button:block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.65625" y="3.66992" width="6.69214" height="6.69336" rx="1" fill="#0051AF" />
          <rect x="3.65625" y="13.6523" width="6.69214" height="6.69336" rx="1" fill="#0051AF" />
          <rect x="13.6539" y="13.6523" width="6.69214" height="6.69336" rx="1" fill="#0051AF" />
          <circle cx="16.9871" cy="7.04102" r="3.69067" fill="#0051AF" />
        </svg>
        {name}
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className={cn(
          "group/collapsible [&[data-state=open]]:bg-[#045FC8] [&[data-state=open]]:text-white rounded-2xl",
          level === 1 && index === 0 && "[&[data-state=open]]:py-2"
        )}
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild className="pl-3 pr-0 rounded-2xl h-12">
          <SidebarMenuButton className="group/button font-bold">
            <MdOutlineFolder className="!size-6 block group-data-[state=open]/collapsible:hidden group-hover/button:hidden" />
            <MdFolder className="!size-[22px] hidden group-data-[state=open]/collapsible:block group-hover/button:block text-[#ffffff] group-hover/button:!text-[#0051AF]" />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="pl-2.5 pr-0">
            {children.map((subItem, i) => (
              <Tree key={i} item={subItem} index={i} level={level + 1} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
