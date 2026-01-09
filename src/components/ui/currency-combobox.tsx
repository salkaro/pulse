"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { currencies, Currency } from "@/constants/currencies";

interface CurrencyComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    readOnly?: boolean;
}

export function CurrencyCombobox({ value, onValueChange, readOnly }: CurrencyComboboxProps) {
    const [open, setOpen] = React.useState(false);

    const selectedCurrency = currencies.find((currency: Currency) => currency.code === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={readOnly}
                >
                    {selectedCurrency
                        ? `${selectedCurrency.symbol} ${selectedCurrency.code} - ${selectedCurrency.name}`
                        : "Select currency..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                            {currencies.map((currency: Currency) => (
                                <CommandItem
                                    key={currency.code}
                                    value={`${currency.code} ${currency.name}`}
                                    onSelect={() => {
                                        onValueChange(currency.code);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === currency.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="mr-2">{currency.symbol}</span>
                                    <span className="font-medium">{currency.code}</span>
                                    <span className="ml-2 text-muted-foreground">
                                        {currency.name}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
