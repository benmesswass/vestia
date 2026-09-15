"use client";

import { useState } from "react";

import { ItemIcon } from "@/components/domain/item-icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatLocation, formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Deposit } from "@/lib/types";

/**
 * Confirmation avant restitution — le seul geste irréversible de l'application.
 */
export function ReturnDepositModal({
  deposit,
  open,
  onClose,
  onConfirmed,
}: {
  deposit: Deposit | null;
  open: boolean;
  onClose: () => void;
  onConfirmed?: (deposit: Deposit) => void;
}) {
  const { state, returnDeposit } = useVestia();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  if (!deposit) return null;

  const customer = state.customers.find(
    (item) => item.id === deposit.customerId,
  );

  const confirm = () => {
    setPending(true);
    // Court délai volontaire : le staff voit le geste aboutir.
    window.setTimeout(() => {
      returnDeposit(deposit.id);
      setPending(false);
      onClose();
      toast({
        title: "Restitution confirmée",
        detail: `${deposit.id} · ${customer?.name ?? "client"}`,
        tone: "success",
      });
      onConfirmed?.(deposit);
    }, 650);
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onClose}
      title="Restituer ce dépôt ?"
      description="Les affaires sortent du vestiaire et le ticket est clôturé."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button variant="success" onClick={confirm} loading={pending}>
            Confirmer la restitution
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-line bg-subtle p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-semibold text-ink">
            {customer?.name ?? "Client"}
          </p>
          <span className="tabular text-[13px] font-semibold text-accent">
            {deposit.id}
          </span>
        </div>

        <ul className="mt-3 space-y-1.5">
          {deposit.items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-[13px] text-ink"
            >
              <ItemIcon kind={item.kind} size={14} className="text-faint" />
              {item.label}
            </li>
          ))}
        </ul>

        <div className="mt-3 border-t border-line pt-3 text-[12.5px] text-muted">
          <p>{formatLocation(deposit.location)}</p>
          <p className="mt-0.5">
            Déposé à {formatTime(deposit.depositedAt)} · par {deposit.staff}
          </p>
        </div>
      </div>
    </Modal>
  );
}
