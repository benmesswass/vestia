import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex">
          <LogoMark size={40} />
        </Link>
        <p className="tabular mt-6 text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
          Erreur 404
        </p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-ink">
          Page introuvable
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Cette page n&apos;existe pas ou a été déplacée. Revenez au tableau de
          bord pour reprendre le service.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink href="/dashboard">Tableau de bord</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Accueil VESTIA
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
