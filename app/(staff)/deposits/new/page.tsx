"use client";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  HardHat,
  LoaderCircle,
  MapPin,
  Package,
  PackagePlus,
  Shirt,
  ShoppingBag,
  Umbrella,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";

import { TicketQr } from "@/components/domain/qr-ticket";
import { SendTicketActions } from "@/components/domain/send-ticket";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { nextFreeLocation } from "@/lib/cloakroom";
import { formatPhone, formatTime } from "@/lib/format";
import { useVestia } from "@/lib/store";
import type { Deposit, DepositItem, ItemKind } from "@/lib/types";

type Step = "items" | "location" | "creating" | "done";

const CHOICES: Array<{ kind: ItemKind; label: string; icon: typeof Shirt }> = [
  { kind: "coat", label: "Manteau", icon: Shirt },
  { kind: "bag", label: "Sac", icon: ShoppingBag },
  { kind: "jacket", label: "Veste", icon: Briefcase },
  { kind: "helmet", label: "Casque", icon: HardHat },
  { kind: "umbrella", label: "Parapluie", icon: Umbrella },
  { kind: "other", label: "Autre", icon: Package },
];

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "items", label: "Objets" },
  { id: "location", label: "Emplacement" },
  { id: "creating", label: "Création" },
  { id: "done", label: "Ticket" },
];

export default function NewDepositPage() {
  const router = useRouter();
  const { state, venue, createDeposit } = useVestia();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("items");
  const [selected, setSelected] = useState<ItemKind[]>([]);
  const [otherLabel, setOtherLabel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [created, setCreated] = useState<Deposit | null>(null);

  const location = useMemo(
    () => nextFreeLocation(venue, state.deposits),
    [venue, state.deposits],
  );

  const items: DepositItem[] = useMemo(
    () =>
      selected.map((kind) => {
        const choice = CHOICES.find((option) => option.kind === kind);
        return {
          kind,
          label:
            kind === "other" && otherLabel.trim().length > 0
              ? otherLabel.trim()
              : (choice?.label ?? "Objet"),
        };
      }),
    [selected, otherLabel],
  );

  const toggle = (kind: ItemKind) => {
    setSelected((current) =>
      current.includes(kind)
        ? current.filter((item) => item !== kind)
        : [...current, kind],
    );
  };

  const confirm = () => {
    setStep("creating");
    // Petit délai : le staff voit l'attribution se faire.
    window.setTimeout(() => {
      const deposit = createDeposit({
        items,
        customerName: name,
        customerPhone: phone,
        channels: phone.trim().length > 0 ? ["qr", "sms"] : ["qr"],
      });

      if (!deposit) {
        setStep("location");
        toast({
          title: "Vestiaire complet",
          detail: "Aucune position libre, libérez un emplacement.",
          tone: "warn",
        });
        return;
      }

      setCreated(deposit);
      setStep("done");
      toast({
        title: "Dépôt créé",
        detail: `${deposit.id} · ${items.length} objet${items.length > 1 ? "s" : ""}`,
        tone: "success",
      });
    }, 900);
  };

  const stepIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Nouveau dépôt"
        subtitle="Trois gestes : les objets, l'emplacement, le ticket."
        actions={
          step === "items" ? (
            <ButtonLink href="/dashboard" variant="ghost">
              <ArrowLeft size={16} />
              Annuler
            </ButtonLink>
          ) : undefined
        }
      />

      {/* Fil d'étapes */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((item, index) => {
          const done = index < stepIndex;
          const current = index === stepIndex;
          return (
            <li key={item.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-[12px] font-semibold transition-colors duration-300",
                  done
                    ? "border-positive bg-positive text-white"
                    : current
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-surface text-faint",
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[12.5px] font-medium sm:block",
                  current ? "text-ink" : "text-faint",
                )}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-line" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      {step === "items" && (
        <div className="animate-fade-up space-y-4">
          <Card>
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
              Que déposez-vous ?
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Sélectionnez un ou plusieurs objets.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CHOICES.map((choice, index) => {
                const active = selected.includes(choice.kind);
                const Icon = choice.icon;
                return (
                  <button
                    key={choice.kind}
                    type="button"
                    onClick={() => toggle(choice.kind)}
                    aria-pressed={active}
                    className={cn(
                      "stagger press relative flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-5",
                      active
                        ? "border-accent bg-accent-soft text-accent shadow-xs"
                        : "border-line-strong bg-surface text-ink hover:border-faint hover:bg-subtle",
                    )}
                    style={{ "--d": `${index * 40}ms` } as CSSProperties}
                  >
                    {active && (
                      <span className="animate-pop absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-accent text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <Icon size={24} strokeWidth={1.8} aria-hidden />
                    <span className="text-[13.5px] font-medium">
                      {choice.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selected.includes("other") && (
              <div className="animate-fade-up mt-4">
                <Field label="Préciser l'objet" htmlFor="other-label">
                  <Input
                    id="other-label"
                    value={otherLabel}
                    onChange={(event) => setOtherLabel(event.target.value)}
                    placeholder="Écharpe, sac de sport…"
                  />
                </Field>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-[15px] font-semibold text-ink">
              Client{" "}
              <span className="text-[13px] font-normal text-faint">
                — facultatif
              </span>
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Le numéro sert uniquement à envoyer le ticket par SMS.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Nom" htmlFor="customer-name">
                <Input
                  id="customer-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Thomas Martin"
                  autoComplete="off"
                />
              </Field>
              <Field label="Téléphone" htmlFor="customer-phone">
                <Input
                  id="customer-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="06 12 34 56 78"
                  inputMode="tel"
                  autoComplete="off"
                />
              </Field>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted">
              {selected.length === 0
                ? "Sélectionnez au moins un objet."
                : `${items.length} objet${items.length > 1 ? "s" : ""} · ${items.map((item) => item.label).join(", ")}`}
            </p>
            <Button
              onClick={() => setStep("location")}
              disabled={selected.length === 0}
              size="lg"
            >
              Continuer
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      )}

      {step === "location" && (
        <div className="animate-fade-up space-y-4">
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <MapPin size={19} />
              </span>
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  Emplacement attribué
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Attribution automatique, au plus près de l&apos;entrée.
                </p>
              </div>
            </div>

            {location ? (
              <>
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Zone", value: location.zone },
                    { label: "Rack", value: String(location.rack) },
                    { label: "Position", value: String(location.position) },
                  ].map((cell, index) => (
                    <div
                      key={cell.label}
                      className="stagger rounded-xl border border-line bg-subtle px-3 py-4 text-center"
                      style={{ "--d": `${index * 80}ms` } as CSSProperties}
                    >
                      <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
                        {cell.label}
                      </p>
                      <p className="tabular mt-1 text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink">
                        {cell.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-line bg-subtle p-4">
                  <p className="mb-3 text-[11px] font-semibold tracking-wide text-faint uppercase">
                    Rack {location.rack} · zone {location.zone}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 12 }, (_, index) => {
                      const position = index + 1;
                      const isTarget = position === location.position;
                      const taken = state.deposits.some(
                        (deposit) =>
                          deposit.status !== "returned" &&
                          deposit.location.zone === location.zone &&
                          deposit.location.rack === location.rack &&
                          deposit.location.position === position,
                      );
                      return (
                        <span
                          key={position}
                          title={`Position ${position}`}
                          className={cn(
                            "grid size-8 place-items-center rounded-lg border text-[11px] font-medium",
                            isTarget
                              ? "animate-pulse-ring border-positive bg-positive text-white"
                              : taken
                                ? "border-accent-line bg-accent-soft text-accent"
                                : "border-line-strong bg-surface text-faint",
                          )}
                        >
                          {position}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12px] text-muted">
                    La position surlignée est celle attribuée à ce dépôt.
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-5 rounded-xl border border-warn-line bg-warn-soft px-4 py-3 text-[13px] text-warn">
                Le vestiaire est complet. Libérez une position avant de créer un
                nouveau dépôt.
              </p>
            )}
          </Card>

          <Card>
            <p className="text-[11px] font-semibold tracking-wide text-faint uppercase">
              Récapitulatif
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {items.map((item) => (
                <li
                  key={item.label}
                  className="rounded-full border border-line bg-subtle px-2.5 py-1 text-[12.5px] text-ink"
                >
                  {item.label}
                </li>
              ))}
            </ul>
            {(name.trim() || phone.trim()) && (
              <p className="mt-3 text-[13px] text-muted">
                {name.trim() || "Client sans nom"}
                {phone.trim() ? ` · ${formatPhone(phone)}` : ""}
              </p>
            )}
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep("items")}>
              <ArrowLeft size={16} />
              Retour
            </Button>
            <Button onClick={confirm} disabled={!location} size="lg">
              Valider le dépôt
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      )}

      {step === "creating" && (
        <Card className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <LoaderCircle
            size={28}
            className="animate-spin-slow text-accent"
            aria-hidden
          />
          <p className="mt-4 text-[15px] font-semibold text-ink">
            Création du dépôt…
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Attribution de l&apos;emplacement et génération du QR code.
          </p>
        </Card>
      )}

      {step === "done" && created && (
        <div className="animate-fade-up space-y-4">
          <Card className="text-center">
            <span className="animate-pop mx-auto grid size-14 place-items-center rounded-full bg-positive text-white">
              <Check size={28} strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Dépôt créé
            </h2>
            <p className="tabular mt-1 text-[28px] leading-none font-semibold tracking-[-0.03em] text-accent">
              {created.id}
            </p>
            <p className="mt-3 text-[13px] text-muted">
              Zone {created.location.zone} · Rack {created.location.rack} ·
              Position {created.location.position} · {formatTime(created.depositedAt)}
            </p>

            <div className="mt-5 flex justify-center">
              <TicketQr depositId={created.id} size={172} />
            </div>

            <p className="mt-3 text-[12.5px] text-muted">
              Le client scanne ce QR code pour retrouver son ticket.
            </p>
          </Card>

          <Card>
            <h3 className="text-[15px] font-semibold text-ink">
              Envoyer le ticket au client
            </h3>
            <p className="mt-1 mb-4 text-[13px] text-muted">
              Envois simulés pour la démonstration.
            </p>
            <SendTicketActions
              depositId={created.id}
              phone={phone.trim() ? formatPhone(phone) : undefined}
            />
          </Card>

          <div className="grid gap-2 sm:grid-cols-3">
            <ButtonLink href={`/ticket/${created.id}`} size="lg">
              Afficher le ticket
            </ButtonLink>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setSelected([]);
                setOtherLabel("");
                setName("");
                setPhone("");
                setCreated(null);
                setStep("items");
              }}
            >
              <PackagePlus size={16} />
              Nouveau dépôt
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
