import { useEffect, useState } from 'react';
import { Car, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/shared/data-table';
import {
  useMakes,
  useCreateMake,
  useUpdateMake,
  useDeleteMake,
  useCreateModel,
  useUpdateModel,
  useDeleteModel,
  useModelsPaginated,
  type CarMake,
  type ModelRow,
} from '@/hooks/use-car-catalog';

const PAGE_SIZE = 25;

// ─── Debounce helper ─────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Make dialogs ─────────────────────────────────────────────────────────────

function MakeDialog({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: CarMake | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const createMutation = useCreateMake();
  const updateMutation = useUpdateMake();
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name: trimmed });
      } else {
        await createMutation.mutateAsync(trimmed);
      }
      onClose();
    } catch {
      // toast shown by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? 'Rename make' : 'Add make'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="make-name">Make name</Label>
            <Input
              id="make-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mercedes-Benz"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMakeDialog({
  make,
  onClose,
}: {
  make: CarMake | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteMake();

  async function handleDelete() {
    if (!make) return;
    try {
      await deleteMutation.mutateAsync(make.id);
      onClose();
    } catch {
      // toast shown by hook
    }
  }

  return (
    <Dialog open={!!make} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete make</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete <strong className="text-foreground">"{make?.name}"</strong>? All models under this make will also be deleted. Vehicles already listed with this make will keep the value.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manage Makes dialog ──────────────────────────────────────────────────────

function ManageMakesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: makesData, isLoading } = useMakes();
  const makes = makesData ?? [];
  const [addOpen, setAddOpen]       = useState(false);
  const [editing, setEditing]       = useState<CarMake | null>(null);
  const [deleting, setDeleting]     = useState<CarMake | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage makes</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
              </div>
            )}
            {!isLoading && makes.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No makes yet.</p>
            )}
            {!isLoading && makes.map((make) => (
              <div
                key={make.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <Car className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium truncate">{make.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setEditing(make)}
                  aria-label={`Rename ${make.name}`}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setDeleting(make)}
                  aria-label={`Delete ${make.name}`}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Add make
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MakeDialog
        open={addOpen || !!editing}
        editing={editing}
        onClose={() => { setAddOpen(false); setEditing(null); }}
      />
      <DeleteMakeDialog make={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}

// ─── Model dialog ─────────────────────────────────────────────────────────────

function ModelDialog({
  open,
  editing,
  defaultMakeId,
  onClose,
}: {
  open: boolean;
  editing: ModelRow | null;
  defaultMakeId?: string;
  onClose: () => void;
}) {
  const { data: makesData } = useMakes();
  const makes = makesData ?? [];

  const [makeId, setMakeId]       = useState(editing?.makeId ?? defaultMakeId ?? '');
  const [name, setName]           = useState(editing?.name ?? '');
  const [startYear, setStartYear] = useState(editing?.startYear?.toString() ?? '');
  const [endYear, setEndYear]     = useState(editing?.endYear?.toString() ?? '');
  const [yearError, setYearError] = useState<string | null>(null);

  const createMutation = useCreateModel();
  const updateMutation = useUpdateModel();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function validateYears(): boolean {
    const start = parseInt(startYear, 10);
    const end   = parseInt(endYear, 10);
    if (isNaN(start) || isNaN(end)) { setYearError('Enter valid years.'); return false; }
    if (start < 1885 || end < 1885) { setYearError('Year must be 1885 or later.'); return false; }
    if (end < start) { setYearError('End year must be ≥ start year.'); return false; }
    setYearError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !makeId || !validateYears()) return;
    const data = {
      name:      name.trim(),
      startYear: parseInt(startYear, 10),
      endYear:   parseInt(endYear, 10),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, makeId: editing.makeId, data });
      } else {
        await createMutation.mutateAsync({ makeId, data });
      }
      onClose();
    } catch {
      // toast shown by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit model' : 'Add model'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="model-make">Make</Label>
            {editing ? (
              <p className="text-sm font-medium text-foreground py-1">{editing.makeName}</p>
            ) : (
              <Select value={makeId} onValueChange={setMakeId}>
                <SelectTrigger id="model-make">
                  <SelectValue placeholder="Select a make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model-name">Model name</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 230SL"
              autoFocus={!!editing}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-year">Start year</Label>
              <Input
                id="start-year"
                type="number"
                inputMode="numeric"
                min={1885}
                max={2000}
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="e.g. 1963"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-year">End year</Label>
              <Input
                id="end-year"
                type="number"
                inputMode="numeric"
                min={1885}
                max={2000}
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="e.g. 1967"
              />
            </div>
          </div>
          {yearError && <p className="text-sm text-destructive">{yearError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !makeId}>
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteModelDialog({
  model,
  onClose,
}: {
  model: ModelRow | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteModel();

  async function handleDelete() {
    if (!model) return;
    try {
      await deleteMutation.mutateAsync({ id: model.id, makeId: model.makeId });
      onClose();
    } catch {
      // toast shown by hook
    }
  }

  return (
    <Dialog open={!!model} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete model</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete <strong className="text-foreground">"{model?.name}"</strong>? Vehicles already listed with this model will keep the value.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const COLUMNS: Column<ModelRow>[] = [
  {
    key: 'makeName',
    header: 'Make',
    className: 'w-[180px]',
    render: (row) => <span className="font-medium">{row.makeName}</span>,
  },
  {
    key: 'name',
    header: 'Model',
    render: (row) => row.name,
  },
  {
    key: 'years',
    header: 'Years',
    className: 'w-[120px] text-muted-foreground',
    render: (row) =>
      row.startYear === row.endYear
        ? String(row.startYear)
        : `${row.startYear}–${row.endYear}`,
  },
];

export default function CarCatalogSettingsPage() {
  const { data: makesData } = useMakes();
  const makes = makesData ?? [];

  const [rawSearch, setRawSearch]           = useState('');
  const [filterMakeId, setFilterMakeId]     = useState('');
  const [page, setPage]                     = useState(1);
  const [addModelOpen, setAddModelOpen]     = useState(false);
  const [editingModel, setEditingModel]     = useState<ModelRow | null>(null);
  const [deletingModel, setDeletingModel]   = useState<ModelRow | null>(null);
  const [manageMakesOpen, setManageMakesOpen] = useState(false);

  const q = useDebounce(rawSearch.trim(), 300);

  // Reset to page 1 when filters change — track previous values during render.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevFilters, setPrevFilters] = useState({ q, filterMakeId });
  if (prevFilters.q !== q || prevFilters.filterMakeId !== filterMakeId) {
    setPrevFilters({ q, filterMakeId });
    setPage(1);
  }

  const { data, isFetching, isError, refetch } = useModelsPaginated({
    q:      q || undefined,
    makeId: filterMakeId || undefined,
    page,
    limit:  PAGE_SIZE,
  });

  const rows       = data?.data ?? [];
  const total      = data?.total ?? 0;

  const actionsColumn: Column<ModelRow> = {
    key: 'actions',
    header: '',
    className: 'w-[80px] text-right',
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); setEditingModel(row); }}
          aria-label={`Edit ${row.name}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); setDeletingModel(row); }}
          aria-label={`Delete ${row.name}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Car Makes & Models"
        subtitle="Manage the makes and models available when listing a vehicle."
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setManageMakesOpen(true)}>
              <Car className="size-4 mr-1.5" />
              Manage makes
            </Button>
            <Button size="sm" onClick={() => setAddModelOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Add model
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search make or model…"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterMakeId} onValueChange={setFilterMakeId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All makes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All makes</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[...COLUMNS, actionsColumn]}
        data={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isFetching && rows.length === 0}
        isError={isError}
        onRetry={() => refetch()}
        keyExtractor={(row) => row.id}
      />

      <ModelDialog
        open={addModelOpen || !!editingModel}
        editing={editingModel}
        onClose={() => { setAddModelOpen(false); setEditingModel(null); }}
      />
      <DeleteModelDialog model={deletingModel} onClose={() => setDeletingModel(null)} />
      <ManageMakesDialog open={manageMakesOpen} onClose={() => setManageMakesOpen(false)} />
    </div>
  );
}
