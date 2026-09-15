"use client";

import {
  ArrowRight,
  Check,
  LoaderCircle,
  MapPin,
  ScanLine,
  Search,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ItemIcon } from "@/components/domain/item-icon";
import { ReturnDepositModal } from "@/components/domain/return-modal";
import { StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { DEMO_TICKET_ID } from "@/lib/demo-data";
import {
  formatLocation,
  formatLocationShort,
  formatPhone,
  formatTime,
} from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Deposit } from "@/lib/types";

type Phase = "idle" | "scanning" | "found" | "returned";

export default function ScanPage() {
  const { state } = useVestia();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("idle");
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(false);

  const customer = deposit
    ? state.customers.find((item) => item.id === deposit.customerId)
    : undefined;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return [];
    const compact = needle.replace(/[\s-]/g, "");
    const customerById = new Map(
      state.customers.map((item) => [item.id, item]),
    );

    return state.deposits
      .filter((item) => {
        const owner = customerById.get(item.customerId);
        return (
          item.id.toLowerCase().replace("-", "").includes(compact) ||
          owner?.name.toLowerCase().includes(needle) ||
          owner?.phone.includes(compact) ||
          formatLocationShort(item.location).toLowerCase().includes(compact)
        );
      })
      .sort((a, b) => {
        // Les dépôts encore au vestiaire d'abord : c'est ce que cherche le staff.
        if (a.status === "returned" && b.status !== "returned") return 1;
        if (b.status === "returned" && a.status !== "returned") return -1;
        return a.depositedAt < b.depositedAt ? 1 : -1;
      })
      .slice(0, 6);
  }, [query, state.deposits, state.customers]);

  const select = (found: Deposit) => {
    setDeposit(found);
    setPhase("found");
    setQuery("");
  };

  const simulateScan = () => {
    setPhase("scanning");
    window.setTimeout(() => {
      const demo = state.deposits.find(
        (item) => item.id === DEMO_TICKET_ID && item.status !== "returned",
      );
      const fallback = state.deposits
        .filter((item) => item.status !== "returned")
        .sort((a, b) => (a.depositedAt < b.depositedAt ? 1 : -1))[0];
      const found = demo ?? fallback;

      if (!found) {
        setPhase("idle");
        toast({
          title: "Aucun ticket actif",
          detail: "Tous les dépôts de la soirée ont été restitués.",
          tone: "warn",
        });
        return;
      }

      setDeposit(found);
      setPhase("found");
      toast({
        title: "Ticket trouvé",
        detail: `${found.id} · scan validé`,
        tone: "success",
      });
    }, 1200);
  };

  const reset = () => {
    setPhase("idle");
    setDeposit(null);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Scanner un ticket"
        subtitle="Scannez le QR code du client ou retrouvez son dépôt à la main."
        actions={
          phase !== "idle" ? (
            <Button variant="ghost" onClick={reset}>
              Nouveau scan
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Zone de scan */}
        <Card className="lg:col-span-3">
          {(phase === "idle" || phase === "scanning") && (
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-2xl",
                  "border-2 border-dashed border-line-strong bg-subtle",
                  phase === "scanning" && "border-accent border-solid",
                )}
              >
                {/* Coins de visée */}
                {[
                  "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg",
                  "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg",
                ].map((position) => (
                  <span
                    key={position}
                    className={cn(
                      "absolute size-10 transition-colors duration-300",
                      position,
                      phase === "scanning" ? "border-accent" : "border-line-strong",
                    )}
                    aria-hidden
                  />
                ))}

                {phase === "scanning" && (
                  <span
                    className="animate-scanline absolute inset-x-10 h-0.5 rounded-full bg-accent shadow-[0_0_16px_rgba(31,90,255,0.7)]"
                    aria-hidden
                  />
                )}

                <div className="flex flex-col items-center gap-3 px-8 text-center">
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl transition-colors duration-300",
                      phase === "scanning"
                        ? "bg-accent text-white"
                        : "bg-surface text-faint shadow-xs",
                    )}
                  >
                    {phase === "scanning" ? (
                      <LoaderCircle size={24} className="animate-spin-slow" />
                    ) : (
                      <ScanLine size={24} />
                    )}
                  </span>
                  <p className="text-[14px] font-medium text-ink">
                    {phase === "scanning"
                      ? "Lecture du QR code…"
                      : "Placez le QR code dans le cadre"}
                  </p>
                  <p className="text-[12.5px] text-muted">
                    {phase === "scanning"
                      ? "Identification du dépôt en cours"
                      : "La caméra du poste est simulée pour la démonstration"}
                  </p>
                </div>
              </div>

              <Button
                onClick={simulateScan}
                loading={phase === "scanning"}
                size="lg"
                className="mt-5 w-full max-w-sm"
              >
                <Sparkles size={17} />
                Simuler un scan
              </Button>
              <p className="mt-2 text-[12px] text-faint">
                Le scan simulé ouvre le ticket {DEMO_TICKET_ID}.
              </p>
            </div>
          )}

          {phase === "found" && deposit && (
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 rounded-xl border border-positive-line bg-positive-soft p-3.5">
                <span className="animate-pop grid size-10 shrink-0 place-items-center rounded-full bg-positive text-white">
                  <Check size={20} strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">
                    Ticket trouvé
                  </p>
                  <p className="text-[12.5px] text-muted">
                    Vérifiez les affaires avant de restituer.
                  </p>
                </div>
                <StatusBadge status={deposit.status} className="ml-auto" />
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-3">
                <p className="tabular text-[30px] leading-none font-semibold tracking-[-0.03em] text-accent">
                  {deposit.id}
                </p>
                <span className="tabular text-[13px] text-muted">
                  déposé à {formatTime(deposit.depositedAt)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-line bg-subtle p-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-faint">
                    <UserRound size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">
                      {customer?.name ?? "Client"}
                    </p>
                    {customer?.phone && (
                      <p className="text-[12.5px] text-muted">
                        {formatPhone(customer.phone)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-line bg-subtle p-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy text-white">
                    <MapPin size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">
                      Zone {deposit.location.zone} · Rack {deposit.location.rack}
                    </p>
                    <p className="text-[12.5px] text-muted">
                      Position {deposit.location.position}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {deposit.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5"
                  >
                    <ItemIcon kind={item.kind} size={16} className="text-faint" />
                    <span className="text-[13.5px] font-medium text-ink">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {deposit.status === "returned" ? (
                  <div className="flex w-full items-center gap-2 rounded-xl border border-line bg-subtle px-4 py-3 text-[13px] text-muted">
                    <Check size={16} className="text-positive" />
                    Ce dépôt a déjà été restitué à{" "}
                    {deposit.returnedAt ? formatTime(deposit.returnedAt) : "—"}.
                  </div>
                ) : (
                  <Button
                    size="lg"
                    variant="success"
                    fullWidth
                    onClick={() => setConfirming(true)}
                  >
                    Restituer les affaires
                    <ArrowRight size={17} />
                  </Button>
                )}
                <ButtonLink
                  href={`/deposits/${deposit.id}`}
                  variant="secondary"
                  size="lg"
                >
                  Ouvrir la fiche
                </ButtonLink>
              </div>
            </div>
          )}

          {phase === "returned" && deposit && (
            <div className="animate-fade-up flex flex-col items-center py-10 text-center">
              <span className="animate-pop grid size-16 place-items-center rounded-full bg-positive text-white">
                <Check size={32} strokeWidth={3} />
              </span>
              <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                Restitution confirmée
              </h2>
              <p className="mt-1.5 text-[13.5px] text-muted">
                {deposit.id} · {customer?.name ?? "Client"} ·{" "}
                {deposit.items.length} objet
                {deposit.items.length > 1 ? "s" : ""} rendu
                {deposit.items.length > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-[12.5px] text-faint">
                {formatLocation(deposit.location)} — position libérée
              </p>

              <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
                <Button size="lg" onClick={reset}>
                  <ScanLine size={17} />
                  Scanner un autre ticket
                </Button>
                <ButtonLink href="/dashboard" variant="secondary" size="lg">
                  Retour au tableau de bord
                </ButtonLink>
              </div>
            </div>
          )}
        </Card>

        {/* Recherche manuelle */}
        <Card className="lg:col-span-2">
          <h2 className="text-[15px] font-semibold text-ink">
            Recherche manuelle
          </h2>
          <p className="mt-1 mb-4 text-[13px] text-muted">
            Ticket perdu, téléphone déchargé : retrouvez le dépôt autrement.
          </p>

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Numéro, nom, téléphone, emplacement…"
            aria-label="Recherche manuelle d'un dépôt"
            icon={<Search size={15} />}
          />

          <div className="mt-3">
            {query.trim().length === 0 ? (
              <ul className="space-y-1.5">
                {[
                  { label: "Numéro de ticket", example: "V-4821" },
                  { label: "Nom du client", example: "Thomas Martin" },
                  { label: "Téléphone", example: "06 12 34 56 78" },
                  { label: "Emplacement", example: "B24-08" },
                ].map((hint) => (
                  <li
                    key={hint.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-subtle px-3 py-2"
                  >
                    <span className="text-[12.5px] text-muted">
                      {hint.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuery(hint.example)}
                      className="tabular press rounded-md px-2 py-0.5 text-[12.5px] font-medium text-accent hover:bg-accent-soft"
                    >
                      {hint.example}
                    </button>
                  </li>
                ))}
              </ul>
            ) : matches.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-soft p-3">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warn" />
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    Aucun dépôt trouvé
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    Ouvrez un incident « ticket perdu » depuis la page{" "}
                    <Link
                      href="/incidents"
                      className="font-medium text-accent hover:underline"
                    >
                      Incidents
                    </Link>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {matches.map((match) => {
                  const owner = state.customers.find(
                    (item) => item.id === match.customerId,
                  );
                  return (
                    <li key={match.id}>
                      <button
                        type="button"
                        onClick={() => select(match)}
                        className="press flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left hover:border-accent hover:bg-accent-soft"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="tabular text-[13px] font-semibold text-ink">
                              {match.id}
                            </span>
                            <StatusBadge status={match.status} />
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-muted">
                            {owner?.name ?? "Client"} ·{" "}
                            {formatLocationShort(match.location)} ·{" "}
                            {formatTime(match.depositedAt)}
                          </span>
                        </span>
                        <ArrowRight size={15} className="shrink-0 text-faint" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <ReturnDepositModal
        deposit={confirming ? deposit : null}
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirmed={(returned) => {
          setDeposit({
            ...returned,
            status: "returned",
          });
          setPhase("returned");
        }}
      />
    </div>
  );
}
