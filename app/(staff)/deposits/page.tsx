"use client";

import { PackagePlus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { DepositsTable } from "@/components/domain/deposits-table";
import { ReturnDepositModal } from "@/components/domain/return-modal";
import { ButtonLink } from "@/components/ui/button";
import { Input, Segmented } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/states";
import { formatLocationShort } from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Deposit, DepositStatus } from "@/lib/types";

type Filter = "all" | DepositStatus;

export default function DepositsPage() {
  const { state } = useVestia();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [returning, setReturning] = useState<Deposit | null>(null);

  const counts = useMemo(
    () => ({
      all: state.deposits.length,
      active: state.deposits.filter((deposit) => deposit.status === "active")
        .length,
      returned: state.deposits.filter((deposit) => deposit.status === "returned")
        .length,
      incident: state.deposits.filter((deposit) => deposit.status === "incident")
        .length,
    }),
    [state.deposits],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const compact = needle.replace(/[\s-]/g, "");
    const customerById = new Map(
      state.customers.map((customer) => [customer.id, customer]),
    );

    return state.deposits
      .filter((deposit) => filter === "all" || deposit.status === filter)
      .filter((deposit) => {
        if (needle.length === 0) return true;
        const customer = customerById.get(deposit.customerId);
        return (
          deposit.id.toLowerCase().replace("-", "").includes(compact) ||
          customer?.name.toLowerCase().includes(needle) ||
          customer?.phone.includes(compact) ||
          formatLocationShort(deposit.location).toLowerCase().includes(compact) ||
          deposit.items.some((item) =>
            item.label.toLowerCase().includes(needle),
          )
        );
      })
      .sort((a, b) => (a.depositedAt < b.depositedAt ? 1 : -1));
  }, [state.deposits, state.customers, query, filter]);

  return (
    <>
      <PageHeader
        title="Dépôts"
        subtitle={`${counts.all} dépôts enregistrés ce soir · ${counts.active} en cours`}
        actions={
          <ButtonLink href="/deposits/new">
            <PackagePlus size={16} />
            Nouveau dépôt
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ticket, nom, téléphone, emplacement, objet…"
          aria-label="Rechercher un dépôt"
          icon={<Search size={15} />}
          className="lg:max-w-md"
        />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Tous", count: counts.all },
            { value: "active", label: "Actifs", count: counts.active },
            { value: "returned", label: "Restitués", count: counts.returned },
            { value: "incident", label: "Incidents", count: counts.incident },
          ]}
          className="self-start"
        />
      </div>

      <DepositsTable
        deposits={filtered}
        customers={state.customers}
        onReturn={setReturning}
        emptyTitle={query ? "Aucun résultat" : "Aucun dépôt"}
        emptyDescription={
          query
            ? `Rien ne correspond à « ${query.trim()} ». Essayez un numéro de ticket ou un nom.`
            : "Les dépôts de la soirée apparaîtront ici."
        }
      />

      <ReturnDepositModal
        deposit={returning}
        open={returning !== null}
        onClose={() => setReturning(null)}
      />
    </>
  );
}
