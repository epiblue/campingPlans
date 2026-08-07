import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
} from "@/components/ui/sidebar"


export function AppSidebar({ children }) {
    return (
        <Sidebar>
            <SidebarContent>
                {children}
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}