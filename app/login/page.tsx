"use client";

import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { VENUE } from "@/lib/demo-data";

const HIGHLIGHTS = [
  "Dépôt en quinze secondes, sans formulaire",
  "Ticket QR envoyé au client, sans application",
  "Restitution scannée et tracée",
  "Occupation du vestiaire en temps réel",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maya@lesonar.fr");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    // Démonstration : aucune authentification réelle n'est effectuée.
    window.setTimeout(() => router.push("/dashboard"), 700);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panneau de marque */}
      <aside className="hidden flex-col justify-between bg-navy p-10 lg:flex">
        <Logo tone="light" subtitle="Vestiaire digital" />

        <div>
          <h1 className="text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-white">
            Le vestiaire de {VENUE.name},
            <br />
            piloté au ticket près.
          </h1>
          <ul className="mt-7 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-[14px] text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[12.5px] text-white/40">
          Démonstration produit · données fictives
        </p>
      </aside>

      {/* Formulaire */}
      <main className="flex items-center justify-center bg-canvas px-5 py-10">
        <div className="animate-fade-up w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="text-[15px] font-semibold tracking-[0.14em] text-ink">
                VESTIA
              </span>
            </Link>
          </div>

          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">
            Connexion
          </h2>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Accédez au poste vestiaire de {VENUE.name}.
          </p>

          <div className="mt-5 rounded-xl border border-accent-line bg-accent-soft px-3.5 py-2.5">
            <p className="text-[12.5px] leading-relaxed text-accent">
              Accès de démonstration — les identifiants sont déjà renseignés.
            </p>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Adresse e-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </Field>

            <Field label="Mot de passe" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="press absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-faint hover:bg-subtle hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" fullWidth loading={pending}>
              Se connecter
              <ArrowRight size={17} />
            </Button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={14} />
            Retour au site
          </Link>
        </div>
      </main>
    </div>
  );
}
