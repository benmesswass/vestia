"use client";

import { ArrowLeft, Mail, Phone, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { DepositsTable } from "@/components/domain/deposits-table";
import { ReturnDepositModal } from "@/components/domain/return-modal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, LoadingState, PageHeader } from "@/components/ui/states";
import { formatDateTime, formatPhone, initials } from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Deposit } from "@/lib/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? ""));
  const { state, ready } = useVestia();
  const [returning, setReturning] = useState<Deposit | null>(null);

  const customer = state.customers.find((item) => item.id === id);

  if (!customer) {
    if (!ready) return <LoadingState label="Chargement de la fiche client…" />;
    return (
      <>
        <PageHeader title="Client introuvable" />
        <ErrorState
          title="Fiche client introuvable"
          description="Ce client n'existe pas dans la soirée en cours."
          action={
            <ButtonLink href="/customers" variant="secondary">
              <ArrowLeft size={16} />
              Retour aux clients
            </ButtonLink>
          }
        />
      </>
    );
  }

  const deposits = state.deposits
    .filter((deposit) => deposit.customerId === customer.id)
    .sort((a, b) => (a.depositedAt < b.depositedAt ? 1 : -1));
  const active = deposits.filter((deposit) => deposit.status !== "returned");

  return (
    <>
      <PageHeader
        title={customer.name}
        subtitle={`${deposits.length} dépôt${deposits.length > 1 ? "s" : ""} · ${active.length} en cours`}
        actions={
          <ButtonLink href="/customers" variant="ghost">
            <ArrowLeft size={16} />
            Clients
          </ButtonLink>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-[15px] font-semibold text-accent">
              {initials(customer.name)}
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-ink">
                {customer.name}
              </p>
              {customer.vip && (
                <span className="mt-1 inline-flex items-center gap-1 text-[12px] text-warn">
                  <Star size={12} />
                  Client fidèle
                </span>
              )}
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-line pt-4">
            <div className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-faint" />
              <dd className="tabular text-[13.5px] text-ink">
                {formatPhone(customer.phone)}
              </dd>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-faint" />
                <dd className="truncate text-[13.5px] text-ink">
                  {customer.email}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2.5">
              <dt className="text-[13px] text-muted">Client depuis</dt>
              <dd className="text-[13px] font-medium text-ink">
                {formatDateTime(customer.since)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2.5">
              <dt className="text-[13px] text-muted">Statut</dt>
              <dd>
                <Badge tone={active.length > 0 ? "accent" : "neutral"} dot>
                  {active.length > 0 ? "Au vestiaire" : "Rendu"}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <div className="xl:col-span-2">
          <Card padded={false} className="p-5">
            <CardHeader
              title="Historique des dépôts"
              subtitle="Tous les passages au vestiaire"
            />
            <DepositsTable
              deposits={deposits}
              customers={state.customers}
              pageSize={8}
              onReturn={setReturning}
              emptyTitle="Aucun dépôt"
              emptyDescription="Ce client n'a encore rien déposé ce soir."
            />
          </Card>
        </div>
      </div>

      <ReturnDepositModal
        deposit={returning}
        open={returning !== null}
        onClose={() => setReturning(null)}
      />
    </>
  );
}
