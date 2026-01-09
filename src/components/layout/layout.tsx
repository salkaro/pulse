"use client"

// Local Imports
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// External Imports
import FirebaseProvider from "../firebase-provider";
import LayoutHeader from "./layout-header";

export default function Layout({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <FirebaseProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <main className={`h-full w-full p-2 md:p-6 ${className}`} >
                        <LayoutHeader />
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </FirebaseProvider>
    )
}