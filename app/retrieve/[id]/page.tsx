"use client";

import { ArrowLeft, Check, Info, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/brand/logo";
import { ItemIcon } from "@/components/domain/item-icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { formatLocation, formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";

export default function RetrievePage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? "")).toUpperCase();
  const { state, ready, returnDeposit } = useVestia();
  const { toast } = useToast();

  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const deposit = state.deposits.find((item) => item.id === id);
  const customer = deposit
    ? state.customers.find((item) => item.id === deposit.customerId)
    : undefined;

  if (!deposit) {
    return (
      <main className="min-h-dvh bg-canvas px-4 py-10">
        <div className="mx-auto max-w-sm">
          {!ready ? (
            <LoadingState label="Chargement du dépôt…" />
          ) : (
            <ErrorState
              title="Dépôt introuvable"
              description={`Le ticket ${id} n'existe pas ou a expiré.`}
              action={
                <ButtonLink href="/" variant="secondary">
                  Retour à l&apos;accueil
                </ButtonLink>
              }
            />
          )}
        </div>
      </main>
    );
  }

  const alreadyReturned = deposit.status === "returned";

  const confirm = () => {
    setPending(true);
    window.setTimeout(() => {
      returnDeposit(deposit.id);
      setPending(false);
      setConfirming(false);
      setDone(true);
      toast({
        title: "Restitution confirmée",
        detail: `${deposit.id} · ${customer?.name ?? "client"}`,
        tone: "success",
      });
    }, 700);
  };

  return (
    <main className="min-h-dvh bg-navy px-4 py-8">
      <div className="mx-auto max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[0.14em] text-white">
            VESTIA
          </span>
        </div>

        {done || alreadyReturned ? (
          <div className="animate-fade-up mt-8 rounded-3xl bg-surface p-6 text-center shadow-lg">
            <span className="animate-pop mx-auto grid size-16 place-items-center rounded-full bg-positive text-white">
              <Check size={32} strokeWidth={3} />
            </span>
            <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-ink">
              Restitution confirmée
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              {deposit.items.length} objet
              {deposit.items.length > 1 ? "s" : ""} remis à{" "}
              {customer?.name ?? "vous"}
              {deposit.returnedAt ? ` à ${formatTime(deposit.returnedAt)}` : ""}.
            </p>

            <ul className="mt-5 space-y-1.5 rounded-xl border border-line bg-subtle px-4 py-3 text-left">
              {deposit.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2.5 text-[13.5px] text-ink"
                >
                  <ItemIcon kind={item.kind} size={15} className="text-faint" />
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2">
              <ButtonLink href={`/ticket/${deposit.id}`} variant="secondary" fullWidth size="lg">
                Revoir mon ticket
              </ButtonLink>
              <ButtonLink href="/" variant="ghost" fullWidth size="lg">
                Retour à l&apos;accueil
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up mt-8 rounded-3xl bg-surface p-6 shadow-lg">
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Retirer mes affaires
            </h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              Présentez-vous au vestiaire, le staff prépare vos affaires.
            </p>

            <div className="mt-5 rounded-xl border border-line bg-subtle p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink">
                  {customer?.name ?? "Client"}
                </p>
                <span className="tabular text-[14px] font-semibold text-accent">
                  {deposit.id}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5">
                {deposit.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 text-[13.5px] text-ink"
                  >
                    <ItemIcon kind={item.kind} size={15} className="text-faint" />
                    {item.label}
                  </li>
                ))}
              </ul>

              <p className="tabular mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[12.5px] text-muted">
                <MapPin size={13} />
                {formatLocation(deposit.location)}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent-line bg-accent-soft p-3.5">
              <Info size={15} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[12.5px] leading-relaxed text-ink">
                Une fois confirmé, le ticket est clôturé et la position est
                libérée. Ne confirmez qu&apos;au moment de récupérer vos affaires.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Button size="lg" fullWidth onClick={() => setConfirming(true)}>
                Confirmer le retrait
              </Button>
              <ButtonLink
                href={`/ticket/${deposit.id}`}
                variant="ghost"
                size="lg"
                fullWidth
              >
                <ArrowLeft size={16} />
                Revenir au ticket
              </ButtonLink>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirming}
        onClose={pending ? () => undefined : () => setConfirming(false)}
        title="Confirmer le retrait ?"
        description="Le ticket sera clôturé et vos affaires sortiront du vestiaire."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button variant="success" onClick={confirm} loading={pending}>
              Confirmer le retrait
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-line bg-subtle p-4">
          <p className="text-[14px] font-semibold text-ink">
            {customer?.name ?? "Client"}
          </p>
          <p className="tabular text-[13px] text-accent">{deposit.id}</p>
          <ul className="mt-2.5 space-y-1">
            {deposit.items.map((item) => (
              <li key={item.label} className="text-[13px] text-ink">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </main>
  );
}
