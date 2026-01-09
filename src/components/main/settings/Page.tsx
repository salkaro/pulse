'use client';

// Local Imports
import Billing from './Billing';
import Overview from './Overview';
import Organisation from './Organisation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Skeleton } from '../../ui/skeleton';
import { useOrganisation } from '@/hooks/useOrganisation';

// External Imports
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { levelTwoAccess } from '@/constants/access';
import Authentication from './dialogs/Authentication';


export default function Page() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const [value, setValue] = useState<string>('overview');
    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const { loading: organisationLoading } = useOrganisation();

    const updateHash = useCallback(
        (tabValue: string) => {
            setValue(tabValue);
            const newUrl = `${pathname}#${tabValue}`;
            router.replace(newUrl, { scroll: false });
        },
        [pathname, router]
    );

    const tabs = useMemo(() => {
        const base = [
            { value: "overview", label: "Overview" },
            { value: "organisation", label: "Organisation" },
            { value: "billing", label: "Billing" },
        ];
        if (hasLevelTwoAccess) {
            base.push(
                { value: "authentication", label: "Authentication" }
            )
        }
        return base;
    }, [hasLevelTwoAccess]);


    // Update active tab based on URL hash on mount or hash change
    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.slice(1);
            if (tabs.some(t => t.value === hash)) {
                setValue(hash);
            } else {
                updateHash("overview");
            }
        };

        // Initial load
        syncFromHash();

        // Listen for future changes (e.g., clicking external links or browser back)
        window.addEventListener("hashchange", syncFromHash);

        return () => {
            window.removeEventListener("hashchange", syncFromHash);
        };
    }, [updateHash, tabs]);

    if (organisationLoading && (value === 'organisation' || value === 'billing')) {
        return (
            <div className="space-y-6 p-4">
                <Skeleton className="h-10 w-64" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    return (
        <Tabs value={value} onValueChange={updateHash}>
            <TabsList className='mx-2 md:mx-0'>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="p-4">
                    {{
                        overview: <Overview />,
                        organisation: <Organisation />,
                        billing: <Billing />,
                        authentication: <Authentication />,
                    }[tab.value]}
                </TabsContent>
            ))}
        </Tabs>
    );
}
