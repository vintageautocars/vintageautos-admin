import { useRef, useState, useEffect } from 'react';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';
import {
  useNegotiation,
  useSendNegotiationMessage,
  useAgreeTerms,
  useRejectNegotiation,
} from '@/hooks/use-negotiations';
import type { Negotiation } from '@/types/negotiation';

function StatusChip({ status }: { status: Negotiation['status'] }) {
  const map = {
    OPEN:     { label: 'Negotiating', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    AGREED:   { label: 'Terms Agreed', cls: 'bg-primary/15 text-primary border-primary/30' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  };
  const { label, cls } = map[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── Naira formatting helper ──────────────────────────────────────────────────

function formatNaira(val: string): string {
  return val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─── Agree Terms Modal ────────────────────────────────────────────────────────

function AgreeTermsModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  askingPrice,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (data: { agreedPrice: number; rentalPrice: number }) => void;
  isPending: boolean;
  askingPrice: number;
}) {
  const [agreedPrice, setAgreedPrice] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ap = parseFloat(agreedPrice.replace(/,/g, ''));
    const rp = parseFloat(rentalPrice.replace(/,/g, ''));
    if (!ap || !rp || ap <= 0 || rp <= 0) return;
    onConfirm({ agreedPrice: ap, rentalPrice: rp });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agree Terms &amp; Approve Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Owner's asking price — reference context */}
          <div className="rounded-lg border border-[#FFFFFF1A] bg-white/5 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Partner's asking price</span>
            <span className="text-sm font-semibold text-foreground">
              ₦{askingPrice.toLocaleString('en-NG')}<span className="text-xs font-normal text-muted-foreground">/slot</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Set the final agreed payout to the partner and the rental price clients will see.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agreed-price">Partner Payout / Slot (₦)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium shrink-0">₦</span>
                <Input
                  id="agreed-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 45,000"
                  value={agreedPrice}
                  onChange={e => setAgreedPrice(formatNaira(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rental-price">Rental Price / Slot (₦)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium shrink-0">₦</span>
                <Input
                  id="rental-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 60,000"
                  value={rentalPrice}
                  onChange={e => setRentalPrice(formatNaira(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Agree &amp; Approve
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RejectModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Vehicle Listing</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Provide a reason for rejecting this vehicle. The partner will be notified by email.
          </p>
          <Textarea
            placeholder="e.g. Vehicle photos are insufficient, pricing terms not agreed…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={isPending || !reason.trim()}
            onClick={() => onConfirm(reason)}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Reject Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MessageBubble({ message }: { message: Negotiation['messages'][number] }) {
  const isAdmin = message.senderRole === 'ADMIN';
  const name = `${message.sender.firstName} ${message.sender.lastName}`;

  return (
    <div className={cn('flex flex-col gap-1', isAdmin ? 'items-end' : 'items-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
        isAdmin
          ? 'rounded-tr-sm bg-primary text-primary-foreground'
          : 'rounded-tl-sm bg-[var(--color-card-background)] border border-[#FFFFFF1A] text-foreground',
      )}>
        {message.body}
      </div>
      <span className="text-[11px] text-muted-foreground">
        {isAdmin ? `Admin · ${name}` : `Partner · ${name}`} · {formatDate(message.createdAt)}
      </span>
    </div>
  );
}

interface NegotiationPanelProps {
  vehicleId:     string;
  vehicleStatus: string;
  dailyRate:     number;
}

export function NegotiationPanel({
  vehicleId,
  vehicleStatus,
  dailyRate,
}: NegotiationPanelProps) {
  const { data: thread, isLoading, isError } = useNegotiation(vehicleId);
  const sendMutation    = useSendNegotiationMessage(vehicleId);
  const agreeMutation   = useAgreeTerms(vehicleId);
  const rejectMutation  = useRejectNegotiation(vehicleId);

  const [message, setMessage]   = useState('');
  const [agreeOpen, setAgreeOpen]   = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim(), {
      onSuccess: () => setMessage(''),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <p className="text-sm text-muted-foreground">Failed to load negotiation thread.</p>
    );
  }

  const isClosed = thread.status !== 'OPEN';
  const isPending = vehicleStatus === 'PENDING_REVIEW';

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">Price Negotiation</p>
          <p className="text-xs text-muted-foreground">
            Discussion between admin team and partner on listing price.
          </p>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Agreed terms summary */}
      {thread.status === 'AGREED' && thread.agreedPrice && thread.rentalPrice && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Agreed Terms</p>
          <div className="flex gap-6 text-sm">
            <span className="text-muted-foreground">Partner payout: <strong className="text-foreground">₦{Number(thread.agreedPrice).toLocaleString('en-NG')}/slot</strong></span>
            <span className="text-muted-foreground">Rental price: <strong className="text-foreground">₦{Number(thread.rentalPrice).toLocaleString('en-NG')}/slot</strong></span>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto rounded-lg border border-[#FFFFFF1A] bg-[var(--color-card-background)] p-3">
        {thread.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No messages yet. Start the conversation with the partner.
          </p>
        ) : (
          thread.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {!isClosed && (
        <form onSubmit={handleSend} className="flex gap-2">
          <Textarea
            placeholder="Type your message…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            maxLength={2000}
            className="flex-1 resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMutation.isPending}
            className="self-end"
          >
            {sendMutation.isPending
              ? <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />
            }
          </Button>
        </form>
      )}

      {/* Admin actions — only on pending vehicles with open thread */}
      {isPending && !isClosed && (
        <>
          <div className="flex gap-2 border-t border-[#FFFFFF1A] pt-4">
            <Button
              size="sm"
              onClick={() => setAgreeOpen(true)}
              disabled={agreeMutation.isPending}
            >
              <CheckCircle2 className="size-4" />
              Agree Terms &amp; Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRejectOpen(true)}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="size-4" />
              Reject
            </Button>
          </div>
        </>
      )}

      <AgreeTermsModal
        open={agreeOpen}
        onOpenChange={setAgreeOpen}
        isPending={agreeMutation.isPending}
        askingPrice={dailyRate}
        onConfirm={(data) => agreeMutation.mutate(data, { onSuccess: () => setAgreeOpen(false) })}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isPending={rejectMutation.isPending}
        onConfirm={(reason) => rejectMutation.mutate(reason, { onSuccess: () => setRejectOpen(false) })}
      />
    </div>
  );
}
