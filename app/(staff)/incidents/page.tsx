"use client";

import { CircleCheck, Plus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import {
  INCIDENT_TYPE_LABELS,
  IncidentModal,
} from "@/components/domain/incident-modal";
import { IncidentStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState, PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Incident, IncidentStatus } from "@/lib/types";

type Filter = "all" | IncidentStatus;

export default function IncidentsPage() {
  const { state, setIncidentStatus } = useVestia();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [resolving, setResolving] = useState<Incident | null>(null);

  const counts = useMemo(
    () => ({
      all: state.incidents.length,
      open: state.incidents.filter((incident) => incident.status === "open")
        .length,
      in_progress: state.incidents.filter(
        (incident) => incident.status === "in_progress",
      ).length,
      resolved: state.incidents.filter(
        (incident) => incident.status === "resolved",
      ).length,
    }),
    [state.incidents],
  );

  const visible = useMemo(
    () =>
      state.incidents
        .filter((incident) => filter === "all" || incident.status === filter)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.incidents, filter],
  );

  const takeOver = (incident: Incident) => {
    setIncidentStatus(incident.id, "in_progress");
    toast({
      title: "Incident pris en charge",
      detail: `${incident.id} · ${INCIDENT_TYPE_LABELS[incident.type]}`,
      tone: "info",
    });
  };

  const resolve = () => {
    if (!resolving) return;
    setIncidentStatus(resolving.id, "resolved");
    toast({
      title: "Incident résolu",
      detail: `${resolving.id} · clôturé`,
      tone: "success",
    });
    setResolving(null);
  };

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle={`${counts.open + counts.in_progress} incident${counts.open + counts.in_progress > 1 ? "s" : ""} en cours sur ${counts.all}`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            Nouvel incident
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Tous", count: counts.all },
            { value: "open", label: "Ouverts", count: counts.open },
            { value: "in_progress", label: "En cours", count: counts.in_progress },
            { value: "resolved", label: "Résolus", count: counts.resolved },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<CircleCheck size={20} />}
          title="Aucun incident"
          description={
            filter === "all"
              ? "La soirée se déroule sans accroc."
              : "Aucun incident dans cette catégorie."
          }
          action={
            <Button size="sm" variant="secondary" onClick={() => setCreateOpen(true)}>
              Signaler un incident
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((incident, index) => (
            <li
              key={incident.id}
              className="stagger"
              style={{ "--d": `${index * 45}ms` } as CSSProperties}
            >
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={
                        incident.status === "resolved"
                          ? "grid size-10 shrink-0 place-items-center rounded-xl bg-positive-soft text-positive"
                          : "grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"
                      }
                    >
                      {incident.status === "resolved" ? (
                        <CircleCheck size={19} />
                      ) : (
                        <TriangleAlert size={19} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-ink">
                          {incident.title}
                        </p>
                        <IncidentStatusBadge status={incident.status} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-muted">
                        <span className="tabular">{incident.id}</span> ·{" "}
                        {INCIDENT_TYPE_LABELS[incident.type]} · ouvert à{" "}
                        {formatTime(incident.createdAt)} · {incident.assignee}
                        {incident.resolvedAt
                          ? ` · résolu à ${formatTime(incident.resolvedAt)}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {incident.status === "open" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => takeOver(incident)}
                      >
                        Prendre en charge
                      </Button>
                    )}
                    {incident.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => setResolving(incident)}
                      >
                        Résoudre
                      </Button>
                    )}
                  </div>
                </div>

                <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
                  {incident.description}
                </p>

                {incident.depositId && (
                  <Link
                    href={`/deposits/${incident.depositId}`}
                    className="tabular mt-2 inline-flex text-[13px] font-medium text-accent hover:underline"
                  >
                    Dépôt {incident.depositId}
                  </Link>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {createOpen && <IncidentModal onClose={() => setCreateOpen(false)} />}

      <Modal
        open={resolving !== null}
        onClose={() => setResolving(null)}
        title="Résoudre cet incident ?"
        description="L'incident sera clôturé et le dépôt concerné repassera en statut actif."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolving(null)}>
              Annuler
            </Button>
            <Button variant="success" onClick={resolve}>
              Confirmer la résolution
            </Button>
          </>
        }
      >
        {resolving && (
          <div className="rounded-xl border border-line bg-subtle p-4">
            <p className="text-[14px] font-semibold text-ink">
              {resolving.title}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              <span className="tabular">{resolving.id}</span> ·{" "}
              {INCIDENT_TYPE_LABELS[resolving.type]}
              {resolving.depositId ? ` · ${resolving.depositId}` : ""}
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              {resolving.description}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
