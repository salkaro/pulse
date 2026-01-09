"use client";

import { Store, ChevronRight, ChevronsUpDown } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePathname } from 'next/navigation'
import { NavSecondary } from "./nav-secondary"
import { sidebarItems, IItem, sidebarFooter } from "@/constants/platform"
import { NavUser } from "./nav-user";
import PlatformSearch from "./platform-search";
import { Separator } from "./separator";
import React from "react";
import SidebarHeader from "./sidebar-header";

// Sidebar component with inset variant
export function AppSidebar() {
    const { state, isMobile } = useSidebar();

    const pathname = usePathname();

    return (
        <Sidebar variant="inset" collapsible="icon" className="group-data-[collapsible=icon]:pr-0">
            <SidebarMenuItem>
                <SidebarHeader />
            </SidebarMenuItem>
            {state === "expanded" && (
                <div className="mt-2">
                    <PlatformSearch />
                </div>
            )}

            <SidebarContent className="mt-4">
                {(Object.entries(sidebarItems) as [string, IItem[]][]).map(([groupKey, items], index) => (
                    <React.Fragment key={groupKey}>
                        <SidebarGroup>
                            <SidebarMenu>
                                {items.map((item) => (
                                    item.items && item.items.length > 0 ? (
                                        <Collapsible
                                            key={item.title}
                                            asChild
                                            defaultOpen={false}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild className="m-0 p-1">
                                                    <SidebarMenuButton
                                                        tooltip={item.title}
                                                        className="group-data-[collapsible=icon]:p-0!"
                                                    >
                                                        <div className="flex items-center justify-center space-x-3.25 group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-full">
                                                            {item.icon && <item.icon className="scale-68 group-data-[collapsible=icon]:m-auto" />}
                                                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                        </div>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem: IItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                    <a href={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </a>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === item.url}
                                                tooltip={item.title}
                                                className="group-data-[collapsible=icon]:p-0!"
                                            >
                                                <a href={item.url} className="flex items-center space-x-2 group-data-[collapsible=icon]:space-x-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-full">
                                                    <item.icon className="group-data-[collapsible=icon]:m-auto" />
                                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                        {index < Object.keys(sidebarItems).length - 1 && <Separator className="my-1" />}
                    </React.Fragment>
                ))}
                <NavSecondary items={sidebarFooter} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="mt-4">
                {!isMobile && (
                    <div className={`flex ${state === "expanded" ? "justify-end" : "justify-center"}`}>
                        <SidebarTrigger />
                    </div>
                )}
                <div className={`flex ${state === "expanded" ? "justify-end" : "justify-center"}`}>
                    <NavUser />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
