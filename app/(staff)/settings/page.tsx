"use client";

import { Building, RotateCcw, Send, Warehouse } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Switch } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useVestia } from "@/lib/store";
import { occupancy } from "@/lib/cloakroom";

export default function SettingsPage() {
  const { state, venue, updateSettings, resetDemo } = useVestia();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  const slots = occupancy(venue, state.deposits);

  const patch = (
    key: keyof typeof state.settings,
    value: boolean | string,
    label: string,
  ) => {
    updateSettings({ [key]: value });
    if (typeof value === "boolean") {
      toast({
        title: value ? `${label} activé` : `${label} désactivé`,
        tone: "info",
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Paramètres"
        subtitle="Configuration du vestiaire et des envois de tickets."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Building size={16} className="text-faint" />
                Établissement
              </span>
            }
            subtitle="Informations affichées sur les tickets clients."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom de l'établissement" htmlFor="venue-name">
              <Input
                id="venue-name"
                value={state.settings.venueName}
                onChange={(event) =>
                  updateSettings({ venueName: event.target.value })
                }
              />
            </Field>
            <Field
              label="Préfixe des tickets"
              htmlFor="ticket-prefix"
              hint="Les prochains dépôts utiliseront ce préfixe."
            >
              <Input
                id="ticket-prefix"
                value={state.settings.ticketPrefix}
                maxLength={3}
                onChange={(event) =>
                  updateSettings({
                    ticketPrefix:
                      event.target.value.toUpperCase().replace(/[^A-Z]/g, "") ||
                      "V",
                  })
                }
              />
            </Field>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
            {[
              { label: "Type", value: venue.type },
              { label: "Ville", value: venue.city },
              { label: "Capacité", value: `${slots.capacity} places` },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-[13.5px] text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Send size={16} className="text-faint" />
                Envoi des tickets
              </span>
            }
            subtitle="Canaux proposés au staff après la création d'un dépôt."
          />
          <div className="divide-y divide-line">
            <Switch
              checked={state.settings.smsEnabled}
              onChange={(value) => patch("smsEnabled", value, "SMS")}
              label="SMS"
              description="Envoi du lien et du QR code par SMS au client."
            />
            <Switch
              checked={state.settings.whatsappEnabled}
              onChange={(value) => patch("whatsappEnabled", value, "WhatsApp")}
              label="WhatsApp"
              description="Alternative au SMS pour la clientèle internationale."
            />
            <Switch
              checked={state.settings.walletEnabled}
              onChange={(value) => patch("walletEnabled", value, "Wallet")}
              label="Carte Wallet"
              description="Ajout du ticket au portefeuille du téléphone."
            />
            <Switch
              checked={state.settings.requirePhone}
              onChange={(value) =>
                patch("requirePhone", value, "Téléphone obligatoire")
              }
              label="Téléphone obligatoire"
              description="Bloque la création d'un dépôt sans numéro de téléphone."
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Warehouse size={16} className="text-faint" />
                Vestiaire
              </span>
            }
            subtitle="Règles d'exploitation appliquées pendant le service."
          />
          <div className="divide-y divide-line">
            <Switch
              checked={state.settings.autoAssignLocation}
              onChange={(value) =>
                patch("autoAssignLocation", value, "Attribution automatique")
              }
              label="Attribution automatique des emplacements"
              description="VESTIA choisit la position libre la plus proche de l'entrée."
            />
            <Switch
              checked={state.settings.closingReminder}
              onChange={(value) =>
                patch("closingReminder", value, "Rappel de fermeture")
              }
              label="Rappel de fermeture"
              description="SMS automatique aux clients dont les affaires sont encore au vestiaire 30 minutes avant la fermeture."
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <RotateCcw size={16} className="text-faint" />
                Démonstration
              </span>
            }
            subtitle="Remet la soirée dans son état initial, prête à être présentée."
          />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-subtle p-4">
            <div>
              <p className="text-[13.5px] font-medium text-ink">
                Réinitialiser le jeu de démonstration
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {state.deposits.length} dépôts, {state.customers.length} clients,{" "}
                {state.incidents.length} incidents.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setResetOpen(true)}>
              <RotateCcw size={15} />
              Réinitialiser
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Réinitialiser la démonstration ?"
        description="Les dépôts créés et les restitutions effectuées pendant la démo seront effacés."
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setResetOpen(false);
                toast({
                  title: "Démonstration réinitialisée",
                  detail: "La soirée repart de son état initial.",
                  tone: "info",
                });
              }}
            >
              Réinitialiser
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          Le ticket V-4821 de Thomas Martin redevient actif, les statistiques
          reviennent à leur valeur de départ et les incidents retrouvent leur
          statut initial.
        </p>
      </Modal>
    </div>
  );
}
