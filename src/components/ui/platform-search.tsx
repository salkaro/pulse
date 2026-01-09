// External Imports
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { LucideProps, SearchIcon } from 'lucide-react';

// Local Imports
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import NoContent from './no-content';
import { Input } from './input';
import { sidebarItems, sidebarFooter, settingsSubItems } from '@/constants/platform';


interface IItem {
    title: string;
    description: string;
    type: "page";
    link: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    subItems?: IItem[];
}

const PlatformSearch: React.FC = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, []);

    const items = useMemo(() => {
        // Flatten all sidebar items from different groups
        const allSidebarItems = Object.values(sidebarItems).flat();

        // Convert SidebarItem to IItem format
        const baseItems: IItem[] = [...allSidebarItems, ...sidebarFooter].map(item => ({
            title: item.title,
            description: item.description,
            type: item.type,
            link: item.url,
            icon: item.icon,
        }));

        // Generate final items list
        return baseItems.map((it) => {
            if (it.title === "Settings") {
                return { ...it, subItems: settingsSubItems };
            }
            return it;
        });
    }, []);

    const lowercase = (str?: string) => str?.toLowerCase() ?? "";

    const filtered = items
        .flatMap((it) =>
            it.subItems
                ? [it, ...it.subItems]
                : [it]
        )
        .filter((it) =>
            lowercase(it.title).includes(lowercase(query)) ||
            lowercase(it.description).includes(lowercase(query))
        );

    const grouped = [
        ...new Map(filtered.map((it) => [it.type, filtered.filter(i => i.type === it.type)]))
            .entries()
    ] as [string, IItem[]][];


    return (
        <div className="w-full max-w-sm">
            {/* Trigger input */}
            <div
                onClick={() => setOpen(true)}
                className="relative w-full max-w-sm cursor-text bg-input rounded-lg"
            >
                <SearchIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-accent-foreground"
                />
                <Input
                    placeholder="Search"
                    readOnly
                    className="pl-10 pr-20 h-9 border-0 font-semibold"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 flex items-center -translate-y-1/2 text-xs text-sidebar-ring">
                    <span className='text-lg'>⌘</span>
                    <span className='text-md font-semibold'>K</span>
                </div>
            </div>

            {/* Command dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    autoFocus
                    placeholder="Quick search"
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        <NoContent text="No results found" />
                    </CommandEmpty>
                    {grouped.map(([type, group]) => (
                        <CommandGroup key={type} heading={type.charAt(0).toUpperCase() + type.slice(1) + "s"}>
                            {group.map((it, index) => (
                                <CommandItem
                                    key={`${type}-${it.link}-${index}`}
                                    onSelect={() => {
                                        setOpen(false);
                                        router.push(it.link);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <div className='flex flex-row items-center gap-2'>
                                            <it.icon size={20} className='text-xs' />
                                            <span>{it.title}</span>
                                        </div>
                                        <small className="text-muted-foreground">
                                            {it.description}
                                        </small>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </div>
    );
};

export default PlatformSearch;
