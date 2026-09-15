"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useVestia } from "@/lib/store";
import type { IncidentType } from "@/lib/types";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  lost_ticket: "Ticket perdu",
  item_issue: "Problème d'objet",
  wrong_location: "Emplacement incorrect",
  other: "Autre incident",
};

/**
 * Le composant n'est monté que lorsque la modale doit s'afficher : le
 * formulaire repart donc toujours d'un état vierge, sans réinitialisation.
 */
export function IncidentModal({
  onClose,
  depositId,
}: {
  onClose: () => void;
  /** Pré-remplit le dépôt concerné. */
  depositId?: string;
}) {
  const { createIncident } = useVestia();
  const { toast } = useToast();

  const [type, setType] = useState<IncidentType>("lost_ticket");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linked, setLinked] = useState(depositId ?? "");
  const [pending, setPending] = useState(false);

  const submit = () => {
    if (title.trim().length === 0) return;
    setPending(true);
    window.setTimeout(() => {
      const incident = createIncident({
        type,
        title: title.trim(),
        description:
          description.trim() || "Aucune précision fournie à l'ouverture.",
        depositId: linked.trim() ? linked.trim().toUpperCase() : undefined,
      });
      setPending(false);
      onClose();
      toast({
        title: "Incident ouvert",
        detail: `${incident.id} · ${INCIDENT_TYPE_LABELS[type]}`,
        tone: "warn",
      });
    }, 500);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Signaler un incident"
      description="L'incident est tracé et rattaché à la soirée en cours."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button
            onClick={submit}
            loading={pending}
            disabled={title.trim().length === 0}
          >
            Ouvrir l&apos;incident
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Type d'incident" htmlFor="incident-type">
          <Select
            id="incident-type"
            value={type}
            onChange={(event) => setType(event.target.value as IncidentType)}
          >
            {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map(
              (value) => (
                <option key={value} value={value}>
                  {INCIDENT_TYPE_LABELS[value]}
                </option>
              ),
            )}
          </Select>
        </Field>

        <Field label="Intitulé" htmlFor="incident-title">
          <Input
            id="incident-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ticket perdu — client sans QR code"
          />
        </Field>

        <Field
          label="Dépôt concerné"
          htmlFor="incident-deposit"
          hint="Facultatif — numéro de ticket, ex. V-4821."
        >
          <Input
            id="incident-deposit"
            value={linked}
            onChange={(event) => setLinked(event.target.value)}
            placeholder="V-4821"
          />
        </Field>

        <Field label="Description" htmlFor="incident-description">
          <Textarea
            id="incident-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ce qui s'est passé, ce qui a déjà été vérifié…"
          />
        </Field>
      </div>
    </Modal>
  );
}
