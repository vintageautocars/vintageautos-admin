import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import {
  ArrowLeft, ArrowRight, CheckCircle2, FilePlus, FileText,
  ImagePlus, Loader2, Save, Trash2, X,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useVehicle, useAdminUpdateVehicle,
  useAdminDeletePhoto, useAdminDeleteDocument,
} from '@/hooks/use-vehicles';
import { useCategories } from '@/hooks/use-categories';
import api from '@/lib/api';
import { vehicleKeys } from '@/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import type { Vehicle, VehiclePhoto, VehicleDocument } from '@/types/vehicle';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const DOC_TYPE_LABELS = {
  REGISTRATION_PAPER: 'Registration paper',
  INSURANCE:          'Insurance certificate',
  ROADWORTHINESS:     'Roadworthiness certificate',
  OTHER:              'Other document',
} as const;

type DocType = keyof typeof DOC_TYPE_LABELS;

interface UploadSig {
  signature: string; timestamp: number; cloudName: string;
  apiKey: string; folder: string; eager?: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:         z.string().min(1).max(100),
  make:         z.string().min(1).max(60),
  model:        z.string().min(1).max(60),
  year:         z.number().int().min(1886).max(new Date().getFullYear()),
  category:     z.string().min(1, 'Select a category'),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']),
  description:  z.string().min(10).max(2000),
  rentalTerms:  z.string().max(1000).optional(),
  dailyRate:    z.number().positive(),
  state:        z.string().min(1, 'Select a state'),
  city:         z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Details', 'Photos', 'Documents', 'Review'] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center mb-10">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center w-16 sm:w-20">
              <div className={cn(
                'size-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors shrink-0',
                done   && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-background text-primary',
                !done && !active && 'border-border bg-background text-muted-foreground',
              )}>
                {done ? <CheckCircle2 className="size-4" /> : step}
              </div>
              <span className={cn(
                'mt-1.5 text-[11px] font-medium text-center leading-tight',
                active && 'text-primary',
                !active && 'text-muted-foreground',
              )}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 w-4 sm:w-8 shrink-0 mt-4 transition-colors',
                i + 1 < current ? 'bg-primary' : 'bg-border',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Step 1: Details ─────────────────────────────────────────────────────────

function Step1Details({ vehicle, onComplete }: {
  vehicle: Vehicle;
  onComplete: (v: Vehicle) => void;
}) {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData ?? [];
  const { mutateAsync: updateVehicle } = useAdminUpdateVehicle();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         vehicle.name,
      make:         vehicle.make,
      model:        vehicle.model,
      year:         vehicle.year,
      category:     vehicle.category,
      transmission: vehicle.transmission,
      description:  vehicle.description,
      rentalTerms:  vehicle.rentalTerms ?? '',
      dailyRate:    vehicle.dailyRate,
      state:        vehicle.state,
      city:         vehicle.city,
    },
  });

  async function onSubmit(data: FormValues) {
    const updated = await updateVehicle({
      id: vehicle.id,
      data: { ...data, rentalTerms: data.rentalTerms || undefined },
    });
    onComplete(updated as Vehicle);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field label="Vehicle name" error={errors.name?.message}>
        <Input placeholder="e.g. 1965 Mercedes-Benz 230 SL" {...register('name')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Make" error={errors.make?.message}>
          <Input placeholder="e.g. Mercedes-Benz" {...register('make')} />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <Input placeholder="e.g. 230 SL" {...register('model')} />
        </Field>
        <Field label="Year" error={errors.year?.message}>
          <Input type="number" placeholder="e.g. 1965" {...register('year', { valueAsNumber: true })} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" error={errors.category?.message}>
          <Controller name="category" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={categoriesLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={categoriesLoading ? 'Loading…' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="Transmission" error={errors.transmission?.message}>
          <Controller name="transmission" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
      </div>

      <Field label="Description" error={errors.description?.message} hint="Minimum 10 characters.">
        <Textarea rows={4} placeholder="Describe the vehicle…" {...register('description')} />
      </Field>

      <Field label="Rental terms" error={errors.rentalTerms?.message}
        hint="Optional — deposit requirements, usage restrictions, or special conditions.">
        <Textarea rows={3} placeholder="e.g. A refundable deposit of ₦50,000 is required…" {...register('rentalTerms')} />
      </Field>

      <Field label="Daily rate (₦)" error={errors.dailyRate?.message} hint="Rental price per day in Nigerian Naira.">
        <Input type="number" step="0.01" min="0" placeholder="e.g. 75000"
          {...register('dailyRate', { valueAsNumber: true })} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="State" error={errors.state?.message}>
          <Controller name="state" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <Input placeholder="e.g. Victoria Island" {...register('city')} />
        </Field>
      </div>

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving…</>
            : <>Save & Continue <ArrowRight className="size-4 ml-2" /></>}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 2: Photos ───────────────────────────────────────────────────────────

function Step2Photos({ vehicle, onBack, onContinue }: {
  vehicle: Vehicle;
  onBack: () => void;
  onContinue: (photos: VehiclePhoto[]) => void;
}) {
  const [photos, setPhotos]     = useState<VehiclePhoto[]>(vehicle.photos);
  const [pending, setPending]   = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState<{ current: number; total: number } | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const { mutateAsync: deletePhoto, isPending: deleting } = useAdminDeletePhoto();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - photos.length - pending.length;
    const toAdd = files.slice(0, remaining).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPending((prev) => [...prev, ...toAdd]);
    setError(null);
    e.target.value = '';
  }

  function removePending(i: number) {
    setPending((prev) => { URL.revokeObjectURL(prev[i].previewUrl); return prev.filter((_, j) => j !== i); });
  }

  async function handleDeletePhoto(photoId: string) {
    await deletePhoto({ vehicleId: vehicle.id, photoId });
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  async function handleUpload() {
    if (pending.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < pending.length; i++) {
        setProgress({ current: i + 1, total: pending.length });
        const compressed = await imageCompression(pending[i].file, { maxSizeMB: 1.5, maxWidthOrHeight: 1600, useWebWorker: true });
        const sigRes = await api.get<UploadSig>(`/vehicles/admin/${vehicle.id}/photos/upload-url`);
        const sig = sigRes.data;
        const fd = new FormData();
        fd.append('file', compressed);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', String(sig.timestamp));
        fd.append('signature', sig.signature);
        fd.append('folder', sig.folder);
        if (sig.eager) fd.append('eager', sig.eager);
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
        if (!cloudRes.ok) throw new Error(`Photo ${i + 1} failed to upload.`);
        const cloudData = await cloudRes.json() as { public_id: string; secure_url: string };
        await api.post(`/vehicles/admin/${vehicle.id}/photos`, {
          publicId: cloudData.public_id,
          url: cloudData.secure_url,
          isPrimary: photos.length === 0 && i === 0,
          order: photos.length + i,
        });
      }
      const updated = await api.get<Vehicle>(`/vehicles/admin/${vehicle.id}`);
      setPhotos(updated.data.photos);
      setPending([]);
      toast.success(`${pending.length} photo${pending.length > 1 ? 's' : ''} uploaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Some photos failed to upload.');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  const total = photos.length + pending.length;
  const busy  = uploading || deleting;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage photos. Up to 10 total. Hover a photo to remove it.</p>

      {photos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Current photos ({photos.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                <img src={photo.url} alt="" className="size-full object-cover" />
                {photo.isPrimary && (
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded leading-none">Primary</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={busy}
                  className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:pointer-events-none"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Ready to upload ({pending.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {pending.map((item, i) => (
              <div key={item.previewUrl} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                <img src={item.previewUrl} alt="" className="size-full object-cover" />
                <button type="button" onClick={() => removePending(i)} disabled={busy}
                  className="absolute top-1 right-1 size-5 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:pointer-events-none">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleUpload} disabled={busy}>
            {uploading && progress
              ? <><Loader2 className="size-4 mr-2 animate-spin" />Uploading {progress.current} of {progress.total}…</>
              : <><ImagePlus className="size-4 mr-2" />Upload {pending.length} photo{pending.length > 1 ? 's' : ''}</>}
          </Button>
        </div>
      )}

      {total < 10 && (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50">
          <ImagePlus className="size-4 shrink-0" />
          <span>{total === 0 ? 'Add photos' : 'Add more'}</span>
          <span className="text-xs">({total}/10)</span>
        </button>
      )}

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleFileChange} />

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}><ArrowLeft className="size-4 mr-2" />Back</Button>
        <Button type="button" onClick={() => onContinue(photos)} disabled={busy}>
          Continue <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Documents ────────────────────────────────────────────────────────

function Step3Documents({ vehicle, onBack, onContinue }: {
  vehicle: Vehicle;
  onBack: () => void;
  onContinue: (docs: VehicleDocument[]) => void;
}) {
  const [docs, setDocs]           = useState<VehicleDocument[]>(vehicle.documents ?? []);
  const [docType, setDocType]     = useState<DocType>('REGISTRATION_PAPER');
  const [docName, setDocName]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const { mutateAsync: deleteDoc, isPending: deleting } = useAdminDeleteDocument();

  async function handleDeleteDoc(docId: string) {
    await deleteDoc({ vehicleId: vehicle.id, docId });
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const name = docName.trim() || file.name.replace(/\.[^.]+$/, '');
    setUploading(true);
    setError(null);
    try {
      const sigRes = await api.get<UploadSig>(`/vehicles/admin/${vehicle.id}/documents/upload-url`);
      const sig = sigRes.data;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`, { method: 'POST', body: fd });
      if (!cloudRes.ok) throw new Error(`Document "${name}" failed to upload.`);
      const cloudData = await cloudRes.json() as { public_id: string };
      const docRes = await api.post<VehicleDocument>(`/vehicles/admin/${vehicle.id}/documents`, { publicId: cloudData.public_id, type: docType, name });
      setDocs((prev) => [...prev, docRes.data]);
      setDocName('');
      toast.success(`"${name}" uploaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload document.');
    } finally {
      setUploading(false);
    }
  }

  const busy = uploading || deleting;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage supporting documents (PDF). This step is optional.</p>

      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{DOC_TYPE_LABELS[doc.type as DocType] ?? doc.type}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteDoc(doc.id)}
                disabled={busy}
                className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Add a document</p>
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="w-full sm:w-52 shrink-0">
            <Select value={docType} onValueChange={(v) => setDocType(v as DocType)} disabled={busy}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(DOC_TYPE_LABELS) as [DocType, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input className="text-sm flex-1" placeholder="Label (optional)" value={docName}
            onChange={(e) => setDocName(e.target.value)} disabled={busy} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
            className="flex items-center gap-2 px-3 h-10 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 shrink-0">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <FilePlus className="size-4" />}
            {uploading ? 'Uploading…' : 'Choose file'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <p className="text-xs text-muted-foreground">PDF only · Registration papers, insurance, roadworthiness, or other documents</p>

      <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}><ArrowLeft className="size-4 mr-2" />Back</Button>
        <Button type="button" onClick={() => onContinue(docs)} disabled={busy}>
          {docs.length === 0 ? 'Skip' : 'Continue'} <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function Step4Review({ vehicle, onBack, onDone }: {
  vehicle: Vehicle;
  onBack: () => void;
  onDone: () => void;
}) {
  const primaryPhoto = vehicle.photos.find((p) => p.isPrimary) ?? vehicle.photos[0];
  const formattedRate = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(vehicle.dailyRate);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Review the updated vehicle before finishing.</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {primaryPhoto && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img src={primaryPhoto.url} alt={vehicle.name} className="size-full object-cover" />
          </div>
        )}
        <div className="p-5 space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-lg">{vehicle.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{vehicle.year} · {vehicle.make} {vehicle.model}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{vehicle.city}, {vehicle.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily rate</p>
              <p className="font-medium text-primary">{formattedRate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Photos</p>
              <p className="font-medium">{vehicle.photos.length} total</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="font-medium">{!vehicle.documents?.length ? 'None' : `${vehicle.documents.length} total`}</p>
            </div>
          </div>
          {vehicle.description && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground line-clamp-3">{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>

      {vehicle.photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {vehicle.photos.slice(0, 10).map((p) => (
            <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={p.url} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="size-4 mr-2" />Back</Button>
        <Button type="button" onClick={onDone}>
          <Save className="size-4 mr-2" />Done
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: initialVehicle, isLoading, isError } = useVehicle(id ?? '');
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const current = vehicle ?? initialVehicle ?? null;

  function handleStep1Complete(v: Vehicle) { setVehicle(v); setStep(2); }
  function handleStep2Continue(photos: VehiclePhoto[]) {
    setVehicle((prev) => prev ? { ...prev, photos } : prev);
    setStep(3);
  }
  function handleStep3Continue(docs: VehicleDocument[]) {
    setVehicle((prev) => prev ? { ...prev, documents: docs } : prev);
    setStep(4);
  }
  function handleDone() {
    qc.invalidateQueries({ queryKey: vehicleKeys.all });
    navigate(`/vehicles/${id}`);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !initialVehicle) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Could not load vehicle.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/vehicles/${id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to vehicle
      </Link>

      <PageHeader
        title={`Edit — ${initialVehicle.name}`}
        subtitle="Update vehicle details, photos, and documents."
      />

      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <StepIndicator current={step} />

          {step === 1 && current && (
            <Step1Details vehicle={current} onComplete={handleStep1Complete} />
          )}
          {step === 2 && current && (
            <Step2Photos vehicle={current} onBack={() => setStep(1)} onContinue={handleStep2Continue} />
          )}
          {step === 3 && current && (
            <Step3Documents vehicle={current} onBack={() => setStep(2)} onContinue={handleStep3Continue} />
          )}
          {step === 4 && current && (
            <Step4Review vehicle={current} onBack={() => setStep(3)} onDone={handleDone} />
          )}
        </div>
      </div>
    </div>
  );
}
