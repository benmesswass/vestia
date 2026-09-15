"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-xs hover:bg-accent-hover disabled:bg-accent/50",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-subtle hover:border-faint",
  ghost: "text-muted hover:bg-subtle hover:text-ink",
  danger:
    "bg-danger text-white shadow-xs hover:brightness-95 disabled:bg-danger/50",
  success:
    "bg-positive text-white shadow-xs hover:brightness-95 disabled:bg-positive/50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
};

const BASE =
  "press inline-flex items-center justify-center font-medium whitespace-nowrap " +
  "disabled:cursor-not-allowed disabled:opacity-60 select-none";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && <LoaderCircle size={16} className="animate-spin-slow" aria-hidden />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  href: string;
  prefetch?: boolean;
  target?: string;
  onClick?: () => void;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  prefetch,
  target,
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      target={target}
      onClick={onClick}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
