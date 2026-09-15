"use client";

import { Check, Clock, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ItemIcon } from "@/components/domain/item-icon";
import { TicketQr } from "@/components/domain/qr-ticket";
import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? "")).toUpperCase();
  const { state, ready } = useVestia();

  const deposit = state.deposits.find((item) => item.id === id);
  const customer = deposit
    ? state.customers.find((item) => item.id === deposit.customerId)
    : undefined;

  if (!deposit) {
    return (
      <main className="min-h-dvh bg-canvas px-4 py-10">
        <div className="mx-auto max-w-sm">
          {!ready ? (
            <LoadingState label="Chargement de votre ticket…" />
          ) : (
            <ErrorState
              title="Ticket introuvable"
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

  const returned = deposit.status === "returned";

  return (
    <main className="min-h-dvh bg-navy">
      {/* En-tête */}
      <header className="px-5 pt-8 pb-16 text-center">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[0.14em] text-white">
            VESTIA
          </span>
        </div>
        <p className="mt-5 text-[13px] text-white/55">{state.settings.venueName}</p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-white">
          Votre dépôt
        </h1>
      </header>

      {/* Ticket */}
      <div className="mx-auto -mt-10 max-w-sm px-4 pb-10">
        <div className="animate-fade-up overflow-hidden rounded-3xl bg-surface shadow-lg">
          <div className="px-6 pt-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">
              Numéro de ticket
            </p>
            <p className="tabular mt-1 text-[38px] leading-none font-semibold tracking-[-0.04em] text-ink">
              {deposit.id}
            </p>
            <p className="mt-2 text-[15px] font-medium text-ink">
              {customer?.name ?? "Client"}
            </p>
          </div>

          <div className="mt-5 flex justify-center px-6">
            <TicketQr depositId={deposit.id} size={188} />
          </div>

          <p className="mt-3 px-6 text-center text-[12.5px] text-muted">
            Présentez ce QR code au vestiaire.
          </p>

          {/* Découpe de ticket */}
          <div className="relative mt-6 h-6">
            <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-navy" />
            <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-navy" />
            <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-line" />
          </div>

          <div className="space-y-4 px-6 pb-6">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                Vos affaires
              </p>
              <ul className="mt-2 space-y-1.5">
                {deposit.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 text-[14px] text-ink"
                  >
                    <ItemIcon kind={item.kind} size={15} className="text-faint" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-faint" />
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                    Emplacement
                  </p>
                  <p className="tabular mt-0.5 text-[13.5px] font-medium text-ink">
                    Zone {deposit.location.zone} · Rack {deposit.location.rack}
                  </p>
                  <p className="tabular text-[12.5px] text-muted">
                    Position {deposit.location.position}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0 text-faint" />
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                    Déposé à
                  </p>
                  <p className="tabular mt-0.5 text-[13.5px] font-medium text-ink">
                    {formatTime(deposit.depositedAt)}
                  </p>
                  {deposit.returnedAt && (
                    <p className="tabular text-[12.5px] text-muted">
                      rendu à {formatTime(deposit.returnedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Statut */}
            <div
              className={
                returned
                  ? "flex items-center gap-2.5 rounded-xl border border-line bg-subtle px-3.5 py-3"
                  : "flex items-center gap-2.5 rounded-xl border border-positive-line bg-positive-soft px-3.5 py-3"
              }
            >
              <span
                className={
                  returned
                    ? "grid size-8 shrink-0 place-items-center rounded-full bg-line-strong text-white"
                    : "animate-pulse-ring grid size-8 shrink-0 place-items-center rounded-full bg-positive text-white"
                }
              >
                {returned ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <ShieldCheck size={16} />
                )}
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-ink">
                  {returned ? "Affaires restituées" : "Dépôt sécurisé"}
                </p>
                <p className="text-[12px] text-muted">
                  {returned
                    ? "Merci, et à bientôt."
                    : "Vos affaires sont sous la responsabilité du vestiaire."}
                </p>
              </div>
            </div>

            {returned ? (
              <ButtonLink href="/" variant="secondary" size="lg" fullWidth>
                Retour à l&apos;accueil
              </ButtonLink>
            ) : (
              <ButtonLink
                href={`/retrieve/${deposit.id}`}
                size="lg"
                fullWidth
              >
                Retirer mes affaires
              </ButtonLink>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-white/45">
          Ticket digital VESTIA · conservez ce lien jusqu&apos;au retrait.
          <br />
          <Link href="/" className="underline hover:text-white/70">
            En savoir plus sur VESTIA
          </Link>
        </p>
      </div>
    </main>
  );
}
