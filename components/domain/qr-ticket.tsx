"use client";

import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * QR code du ticket.
 *
 * L'URL absolue dépend de l'hôte : elle est donc calculée après le montage.
 * Le premier rendu (serveur et client) utilise l'URL de marque, ce qui évite
 * tout écart d'hydratation tout en restant scannable pendant la démo.
 */
export function TicketQr({
  depositId,
  size = 200,
  className,
}: {
  depositId: string;
  size?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const url = hydrated
    ? `${window.location.origin}/ticket/${depositId}`
    : `https://vestia.app/t/${depositId}`;

  return (
    <div
      className={cn(
        "inline-grid place-items-center rounded-2xl border border-line bg-white p-4 shadow-sm",
        className,
      )}
    >
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        marginSize={0}
        bgColor="#ffffff"
        fgColor="#0a1a33"
        title={`QR code du ticket ${depositId}`}
      />
    </div>
  );
}
