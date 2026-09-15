"use client";

import {
  ArrowRight,
  ChartColumn,
  Check,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  Timer,
  TriangleAlert,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Logo, LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const VENUE_TYPES = [
  "Clubs",
  "Bars",
  "Restaurants",
  "Salles de concert",
  "Théâtres",
  "Événements",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Dépôt en 15 secondes",
    detail:
      "Le staff sélectionne les objets, VESTIA attribue l'emplacement et génère le ticket. Aucun formulaire inutile.",
  },
  {
    icon: QrCode,
    title: "Ticket client sans application",
    detail:
      "Un QR code envoyé par SMS, WhatsApp ou e-mail. Le client ouvre un lien, rien à installer.",
  },
  {
    icon: MapPin,
    title: "Emplacement automatique",
    detail:
      "Zone, rack et position attribués à la volée. Plus personne ne cherche un manteau pendant dix minutes.",
  },
  {
    icon: ScanLine,
    title: "Restitution scannée",
    detail:
      "Un scan, une confirmation, la position se libère. Chaque remise est horodatée et signée.",
  },
  {
    icon: TriangleAlert,
    title: "Incidents tracés",
    detail:
      "Ticket perdu, objet oublié, emplacement erroné : tout est consigné et suivi jusqu'à la résolution.",
  },
  {
    icon: ChartColumn,
    title: "Pilotage en temps réel",
    detail:
      "Affluence, occupation, durée de garde. De quoi dimensionner les équipes soirée après soirée.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Le client dépose",
    detail:
      "Le staff sélectionne les objets sur l'écran. L'emplacement est attribué automatiquement.",
  },
  {
    number: "02",
    title: "Le ticket part",
    detail:
      "Un QR code est généré et envoyé sur le téléphone du client. Le papier disparaît.",
  },
  {
    number: "03",
    title: "La restitution est scannée",
    detail:
      "Le client présente son QR, le staff confirme. Le mouvement est tracé, la position libérée.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {[
              { href: "#fonctionnalites", label: "Fonctionnalités" },
              { href: "#parcours", label: "Comment ça marche" },
              { href: "#etablissements", label: "Établissements" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13.5px] font-medium text-muted transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Connexion
            </ButtonLink>
            <ButtonLink href="/dashboard" size="sm">
              Voir la démo
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent">
              <ShieldCheck size={14} />
              Le vestiaire digital des lieux à fort débit
            </span>

            <h1 className="mt-5 text-[36px] leading-[1.08] font-semibold tracking-[-0.035em] text-ink sm:text-[46px]">
              Remplacez le ticket papier
              <br />
              par un vestiaire{" "}
              <span className="text-accent">qui se pilote</span>.
            </h1>

            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
              VESTIA équipe les clubs, bars, restaurants et salles de spectacle.
              Dépôt en quinze secondes, ticket QR envoyé au client, restitution
              scannée et zéro litige en fin de soirée.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" size="lg">
                Ouvrir la démonstration
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink href="/ticket/V-4821" variant="secondary" size="lg">
                Voir un ticket client
              </ButtonLink>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {[
                "Aucune application à installer",
                "Compatible tablette et mobile",
                "Mise en service en une soirée",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-[13px] text-muted"
                >
                  <Check size={14} className="text-positive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Aperçu produit */}
          <div className="animate-fade-up relative" style={{ "--d": "120ms" } as CSSProperties}>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <LogoMark size={28} />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Le Sonar</p>
                    <p className="text-[11px] text-faint">Samedi · 23:12</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-positive-line bg-positive-soft px-2.5 py-1 text-[11px] font-medium text-positive">
                  <span className="size-1.5 rounded-full bg-positive" />
                  Service ouvert
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: "Dépôts", value: "96" },
                  { label: "En cours", value: "77" },
                  { label: "Incidents", value: "2" },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="stagger rounded-xl border border-line bg-subtle px-3 py-3"
                    style={{ "--d": `${200 + index * 80}ms` } as CSSProperties}
                  >
                    <p className="text-[11px] text-muted">{stat.label}</p>
                    <p className="tabular mt-1 text-[22px] leading-none font-semibold tracking-[-0.03em] text-ink">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between">
                  <span className="tabular text-[14px] font-semibold text-accent">
                    V-4821
                  </span>
                  <span className="rounded-full border border-accent-line bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-accent uppercase">
                    Actif
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-medium text-ink">
                  Thomas Martin
                </p>
                <p className="text-[12px] text-muted">
                  Manteau noir · Sac noir
                </p>
                <p className="tabular mt-2 border-t border-line pt-2 text-[12px] text-faint">
                  Zone B · Rack 24 · Position 8 — 22:43
                </p>
              </div>

              <div className="mt-3 grid grid-cols-6 gap-1">
                {Array.from({ length: 24 }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-4 rounded-[3px]",
                      index % 3 === 0 ? "bg-line" : "bg-accent/70",
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Établissements */}
      <section id="etablissements" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <p className="text-center text-[12px] font-semibold tracking-[0.12em] text-faint uppercase">
            Pensé pour les lieux qui gèrent un vestiaire
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {VENUE_TYPES.map((type) => (
              <li
                key={type}
                className="text-[15px] font-medium tracking-[-0.01em] text-muted"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
              Tout ce qu&apos;un vestiaire doit gérer, en un seul outil
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Du premier manteau de la soirée au dernier sac récupéré à la
              fermeture, chaque mouvement est enregistré.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className="stagger rounded-card border border-line bg-surface p-5 shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-md"
                style={{ "--d": `${index * 60}ms` } as CSSProperties}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <feature.icon size={19} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  {feature.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Parcours */}
      <section id="parcours" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
              Trois gestes, zéro papier
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Le parcours complet tient en trois étapes, aussi bien pour le staff
              que pour le client.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.number}
                className="stagger relative rounded-card border border-line bg-surface p-6"
                style={{ "--d": `${index * 80}ms` } as CSSProperties}
              >
                <span className="tabular text-[13px] font-semibold tracking-wide text-accent">
                  {step.number}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Timer, value: "15 s", label: "pour créer un dépôt" },
              { icon: QrCode, value: "0", label: "ticket papier imprimé" },
              { icon: ShieldCheck, value: "100 %", label: "des mouvements tracés" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-card border border-line bg-canvas p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-xs">
                  <stat.icon size={18} />
                </span>
                <div>
                  <p className="tabular text-[22px] leading-none font-semibold tracking-[-0.03em] text-ink">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center lg:py-20">
          <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
            Voyez VESTIA tourner sur une vraie soirée
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">
            La démonstration est préchargée avec une soirée complète : 96 dépôts,
            un vestiaire à moitié plein et un ticket client prêt à être scanné.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard" size="lg">
              Ouvrir le tableau de bord
              <ArrowRight size={17} />
            </ButtonLink>
            <ButtonLink
              href="/scan"
              size="lg"
              variant="secondary"
              className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:border-white/25"
            >
              <ScanLine size={17} />
              Tester le scan
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Logo size={28} />
          <p className="text-[12.5px] text-faint">
            Démonstration produit · données fictives
          </p>
        </div>
      </footer>
    </div>
  );
}
