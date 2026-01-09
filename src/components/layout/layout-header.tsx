import React from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import { usePathname } from 'next/navigation';

const LayoutHeader = () => {
    const pathname = usePathname();
    const { isMobile } = useSidebar()

    const title =
        pathname === "/" || pathname === "/dashboard"
            ? "Dashboard"
            : pathname
                .split("/")
                .filter(Boolean)
                .pop()!
                .split("-")
                .map(w => w[0]?.toUpperCase() + w.slice(1))
                .join(" ");

    return (
        <div className='flex justify-between p-2 md:p-0'>
            <h1 className="text-2xl font-semibold tracking-tight mb-4">{title}</h1>
            {isMobile && <SidebarTrigger />}
            
        </div>
    )
}

export default LayoutHeader
