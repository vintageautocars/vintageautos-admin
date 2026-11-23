import { useState } from 'react';
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from '@/hooks/use-categories';

// ─── Add / Edit dialog ────────────────────────────────────────────────────────

function CategoryDialog({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Category | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isEdit = editing !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editing.id, data: { name: trimmed } });
      } else {
        await createMutation.mutateAsync({ name: trimmed });
      }
      onClose();
    } catch {
      // toast already shown by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Rename category' : 'Add category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sedans"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isEdit ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteDialog({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteCategory();

  async function handleDelete() {
    if (!category) return;
    try {
      await deleteMutation.mutateAsync(category.id);
      onClose();
    } catch {
      // toast already shown by hook
    }
  }

  return (
    <Dialog open={!!category} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete <strong className="text-foreground">"{category?.name}"</strong>? Vehicles already assigned this category will keep the value but it will no longer appear in the category list.
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

export default function CategoriesSettingsPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const categories = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vehicle Categories"
        subtitle="Manage the category list used when adding vehicles."
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1.5" />
            Add category
          </Button>
        }
      />

      <div className="max-w-lg">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
            Failed to load categories.
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet. Add one above.</p>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
                <span className="flex-1 text-sm font-medium">{cat.name}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditing(cat)}
                    aria-label={`Rename ${cat.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(cat)}
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryDialog
        open={addOpen || !!editing}
        editing={editing}
        onClose={() => { setAddOpen(false); setEditing(null); }}
      />
      <DeleteDialog
        category={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
