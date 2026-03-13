'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/class-name.util';

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  emptyText = 'Nenhum item encontrado.',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => [option.label, option.value].join(' ').toLowerCase().includes(normalized));
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filtrar..."
          className="mb-2"
        />
        <div className="max-h-56 space-y-1 overflow-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  option.value === value && 'bg-accent',
                )}
              >
                <span>{option.label}</span>
                <Check className={cn('size-4', option.value === value ? 'opacity-100' : 'opacity-0')} />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
