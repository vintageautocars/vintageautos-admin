import { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { AdminUser } from '@/types/user';
import type { OwnerProfile } from '@/types/owner';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function useOwnerSearch(search: string) {
  return useQuery({
    queryKey: ['owner-combobox', 'owners', search],
    queryFn: async () => {
      const res = await api.get<{ items: OwnerProfile[] }>('/onboarding/admin/applications', {
        params: { status: 'APPROVED', search, pageSize: 10 },
      });
      return res.data.items ?? [];
    },
    enabled: search.length >= 1,
    staleTime: 30_000,
  });
}

function useAdminSearch(search: string) {
  return useQuery({
    queryKey: ['owner-combobox', 'admins', search],
    queryFn: async () => {
      const res = await api.get<{ items: AdminUser[] }>('/users/admin', {
        params: { search: search || undefined, pageSize: 10 },
      });
      return res.data.items ?? [];
    },
    staleTime: 30_000,
  });
}

export function OwnerCombobox({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: owners = [], isFetching: ownersFetching } = useOwnerSearch(search);
  const { data: admins = [], isFetching: adminsFetching } = useAdminSearch(search);

  const isFetching = adminsFetching || ownersFetching;

  // Build a display label for the selected value
  const selectedAdmin = admins.find((a) => a.id === value);
  const selectedOwner = owners.find((o) => o.userId === value);
  const selectedLabel = selectedAdmin
    ? `${selectedAdmin.firstName} ${selectedAdmin.lastName}`
    : selectedOwner?.user
    ? `${selectedOwner.user.firstName} ${selectedOwner.user.lastName}`
    : value || '';

  // Keep selected label visible after closing
  const [committedLabel, setCommittedLabel] = useState('');

  const handleSelect = useCallback((id: string, label: string) => {
    onChange(id);
    setCommittedLabel(label);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const displayLabel = committedLabel || selectedLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !displayLabel && 'text-muted-foreground')}>
            {displayLabel || 'Search by name or email…'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a name or email…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {adminsFetching && admins.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {!isFetching && admins.length === 0 && owners.length === 0 && search.length === 0 && (
              <CommandEmpty>No admins found.</CommandEmpty>
            )}
            {!isFetching && admins.length === 0 && owners.length === 0 && search.length > 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {ownersFetching && search.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching owners…
              </div>
            )}
            {!adminsFetching && admins.length > 0 && (
              <CommandGroup heading="Admins">
                {admins.map((a) => {
                  const label = `${a.firstName} ${a.lastName}`;
                  return (
                    <CommandItem
                      key={a.id}
                      value={a.id}
                      onSelect={() => handleSelect(a.id, label)}
                    >
                      <Check className={cn('mr-2 h-4 w-4', value === a.id ? 'opacity-100' : 'opacity-0')} />
                      <span>{label}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground truncate">{a.email}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {!ownersFetching && admins.length > 0 && owners.length > 0 && <CommandSeparator />}
            {!ownersFetching && owners.length > 0 && (
              <CommandGroup heading="Vehicle Owners">
                {owners.map((o) => {
                  const label = o.user ? `${o.user.firstName} ${o.user.lastName}` : o.userId;
                  return (
                    <CommandItem
                      key={o.userId}
                      value={o.userId}
                      onSelect={() => handleSelect(o.userId, label)}
                    >
                      <Check className={cn('mr-2 h-4 w-4', value === o.userId ? 'opacity-100' : 'opacity-0')} />
                      <span>{label}</span>
                      {o.user && (
                        <span className="ml-1.5 text-xs text-muted-foreground truncate">{o.user.email}</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
