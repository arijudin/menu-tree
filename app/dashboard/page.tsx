import { AppSidebar } from "@/components/app-sidebar"
import MenusPage from "@/components/menus/menus-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MdFolder } from "react-icons/md";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex flex-col md:flex-row h-20 py-0.5 shrink-0 md:items-center gap-0 md:gap-2 px-4 mt-5">
          <SidebarTrigger className="block md:hidden -ml-1 mb-5 md:mb-0" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="md:block">
                <MdFolder className="!size-6 text-[#D0D5DD]" />
              </BreadcrumbItem>
              <BreadcrumbSeparator className="md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">Menus</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <MenusPage />
      </SidebarInset>
    </SidebarProvider>
  )
}
