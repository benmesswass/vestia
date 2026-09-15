"use client";

import {
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { IncidentModal } from "@/components/domain/incident-modal";
import { ItemIcon } from "@/components/domain/item-icon";
import { TicketQr } from "@/components/domain/qr-ticket";
import { ReturnDepositModal } from "@/components/domain/return-modal";
import { SendTicketActions } from "@/components/domain/send-ticket";
import { Timeline } from "@/components/domain/timeline";
import { StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, LoadingState, PageHeader } from "@/components/ui/states";
import {
  DEMO_NOW,
  formatDuration,
  formatLocation,
  formatPhone,
  formatTime,
  minutesBetween,
} from "@/lib/format";
import { useVestia } from "@/lib/store";

export default function DepositDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? "")).toUpperCase();
  const { state, ready } = useVestia();
  const [returning, setReturning] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);

  const deposit = state.deposits.find((item) => item.id === id);

  if (!deposit) {
    // L'état est relu après le montage : on n'annonce l'absence qu'une fois prêt.
    if (!ready) return <LoadingState label="Chargement du dépôt…" />;
    return (
      <>
        <PageHeader title="Dépôt introuvable" />
        <ErrorState
          title={`Aucun dépôt ${id}`}
          description="Ce numéro de ticket n'existe pas dans la soirée en cours."
          action={
            <ButtonLink href="/deposits" variant="secondary">
              <ArrowLeft size={16} />
              Retour aux dépôts
            </ButtonLink>
          }
        />
      </>
    );
  }

  const customer = state.customers.find(
    (item) => item.id === deposit.customerId,
  );
  const relatedIncidents = state.incidents.filter(
    (incident) => incident.depositId === deposit.id,
  );
  const keptMinutes = minutesBetween(
    deposit.depositedAt,
    deposit.returnedAt ?? DEMO_NOW,
  );

  return (
    <>
      <PageHeader
        title={deposit.id}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={deposit.status} />
            <span>
              {customer?.name ?? "Client"} · déposé à{" "}
              {formatTime(deposit.depositedAt)}
            </span>
          </span>
        }
        actions={
          <>
            <ButtonLink href="/deposits" variant="ghost">
              <ArrowLeft size={16} />
              Dépôts
            </ButtonLink>
            <Button variant="secondary" onClick={() => setIncidentOpen(true)}>
              <TriangleAlert size={16} />
              Signaler
            </Button>
            {deposit.status !== "returned" && (
              <Button variant="success" onClick={() => setReturning(true)}>
                Restituer les affaires
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Client" />
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <UserRound size={19} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink">
                    {customer?.name ?? "Client sans nom"}
                  </p>
                  {customer?.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                      <Phone size={13} />
                      {formatPhone(customer.phone)}
                    </p>
                  )}
                  {customer && (
                    <Link
                      href={`/customers/${customer.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                    >
                      Voir la fiche client
                      <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Emplacement" />
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-white">
                  <MapPin size={19} />
                </span>
                <div>
                  <p className="tabular text-[15px] font-semibold text-ink">
                    Zone {deposit.location.zone} · Rack {deposit.location.rack}
                  </p>
                  <p className="tabular mt-0.5 text-[13px] text-muted">
                    Position {deposit.location.position}
                  </p>
                  <Link
                    href="/plan"
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                  >
                    Voir sur le plan
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Objets déposés"
              subtitle={`${deposit.items.length} objet${deposit.items.length > 1 ? "s" : ""} confié${deposit.items.length > 1 ? "s" : ""} au vestiaire`}
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {deposit.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-line bg-subtle px-3 py-2.5"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-surface text-faint">
                    <ItemIcon kind={item.kind} size={16} />
                  </span>
                  <span className="text-[13.5px] font-medium text-ink">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Horodatage" />
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-subtle px-3 py-3">
                <dt className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                  Déposé à
                </dt>
                <dd className="tabular mt-1 text-[18px] font-semibold text-ink">
                  {formatTime(deposit.depositedAt)}
                </dd>
                <dd className="text-[12px] text-muted">par {deposit.staff}</dd>
              </div>
              <div className="rounded-xl border border-line bg-subtle px-3 py-3">
                <dt className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                  Restitué à
                </dt>
                <dd className="tabular mt-1 text-[18px] font-semibold text-ink">
                  {deposit.returnedAt ? formatTime(deposit.returnedAt) : "—"}
                </dd>
                <dd className="text-[12px] text-muted">
                  {deposit.returnedAt ? "scan validé" : "en cours de garde"}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-subtle px-3 py-3">
                <dt className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                  Durée
                </dt>
                <dd className="tabular mt-1 flex items-center gap-1.5 text-[18px] font-semibold text-ink">
                  <Clock size={15} className="text-faint" />
                  {formatDuration(keptMinutes)}
                </dd>
                <dd className="text-[12px] text-muted">
                  {formatLocation(deposit.location)}
                </dd>
              </div>
            </dl>
          </Card>

          {relatedIncidents.length > 0 && (
            <Card>
              <CardHeader
                title="Incidents liés"
                subtitle={`${relatedIncidents.length} incident${relatedIncidents.length > 1 ? "s" : ""} rattaché${relatedIncidents.length > 1 ? "s" : ""} à ce dépôt`}
              />
              <ul className="space-y-2">
                {relatedIncidents.map((incident) => (
                  <li
                    key={incident.id}
                    className="rounded-xl border border-danger-line bg-danger-soft px-3 py-2.5"
                  >
                    <p className="text-[13.5px] font-medium text-ink">
                      {incident.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {incident.id} · ouvert à {formatTime(incident.createdAt)} ·{" "}
                      {incident.assignee}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href="/incidents"
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
              >
                Ouvrir les incidents
                <ExternalLink size={13} />
              </Link>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="text-center">
            <CardHeader title="Ticket client" className="text-left" />
            <div className="flex justify-center">
              <TicketQr depositId={deposit.id} size={160} />
            </div>
            <ButtonLink
              href={`/ticket/${deposit.id}`}
              variant="secondary"
              fullWidth
              className="mt-4"
            >
              Afficher le ticket client
              <ExternalLink size={15} />
            </ButtonLink>
            <div className="mt-4 border-t border-line pt-4 text-left">
              <p className="mb-2.5 text-[11px] font-semibold tracking-wide text-faint uppercase">
                Renvoyer le ticket
              </p>
              <SendTicketActions
                depositId={deposit.id}
                phone={customer ? formatPhone(customer.phone) : undefined}
                compact
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Historique" subtitle="Chaque mouvement est tracé" />
            <Timeline events={deposit.timeline} />
          </Card>
        </div>
      </div>

      <ReturnDepositModal
        deposit={returning ? deposit : null}
        open={returning}
        onClose={() => setReturning(false)}
      />
      {incidentOpen && (
        <IncidentModal
          onClose={() => setIncidentOpen(false)}
          depositId={deposit.id}
        />
      )}
    </>
  );
}
