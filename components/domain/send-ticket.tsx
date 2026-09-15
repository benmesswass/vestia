"use client";

import { Check, LoaderCircle, Mail, MessageCircle, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useVestia } from "@/lib/store";
import type { TicketChannel } from "@/lib/types";

const CHANNELS: Array<{
  channel: TicketChannel;
  label: string;
  icon: typeof Mail;
  detail: string;
}> = [
  { channel: "sms", label: "SMS", icon: Smartphone, detail: "Lien + QR par SMS" },
  {
    channel: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    detail: "Message WhatsApp",
  },
  { channel: "email", label: "E-mail", icon: Mail, detail: "Ticket par e-mail" },
  { channel: "wallet", label: "Wallet", icon: Wallet, detail: "Carte Wallet" },
];

/**
 * Envoi du ticket au client. Les envois sont simulés pour la démonstration :
 * aucun message réel n'est émis.
 */
export function SendTicketActions({
  depositId,
  phone,
  className,
  compact = false,
}: {
  depositId: string;
  phone?: string;
  className?: string;
  compact?: boolean;
}) {
  const { state, sendTicket } = useVestia();
  const { toast } = useToast();
  const [pending, setPending] = useState<TicketChannel | null>(null);

  const deposit = state.deposits.find((item) => item.id === depositId);
  const sent = new Set(deposit?.channels ?? []);

  const send = (channel: TicketChannel, label: string) => {
    if (pending) return;
    setPending(channel);
    window.setTimeout(() => {
      sendTicket(depositId, channel);
      setPending(null);
      toast({
        title: "Ticket envoyé",
        detail: phone ? `${label} · ${phone}` : label,
        tone: "success",
      });
    }, 600);
  };

  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {CHANNELS.map(({ channel, label, icon: Icon, detail }) => {
        const isSent = sent.has(channel);
        const isPending = pending === channel;
        return (
          <button
            key={channel}
            type="button"
            onClick={() => send(channel, label)}
            disabled={isPending}
            title={detail}
            className={cn(
              "press flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3",
              "text-[12.5px] font-medium",
              isSent
                ? "border-positive-line bg-positive-soft text-positive"
                : "border-line-strong bg-surface text-ink hover:border-accent hover:bg-accent-soft hover:text-accent",
            )}
          >
            {isPending ? (
              <LoaderCircle size={17} className="animate-spin-slow" aria-hidden />
            ) : isSent ? (
              <Check size={17} strokeWidth={2.6} aria-hidden />
            ) : (
              <Icon size={17} aria-hidden />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
