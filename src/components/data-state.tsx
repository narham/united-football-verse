import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Database, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================
// Unified Data State Wrappers — spec §28
// Setiap halaman/data view memiliki konsep: Loading / Empty / Error / Success
// ============================================================

type DataStatus = "loading" | "empty" | "error" | "success";

interface DataStateProps {
  status: DataStatus;
  children: ReactNode;
  loadingNode?: ReactNode;
  emptyNode?: ReactNode;
  errorMessage?: string;
  errorNode?: ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function DataState({
  status,
  children,
  loadingNode,
  emptyNode,
  errorMessage,
  errorNode,
  onRetry,
  className,
}: DataStateProps) {
  if (status === "loading") {
    return (
      <div className={cn(className)} role="status" aria-live="polite" aria-label="Memuat data">
        {loadingNode ?? <DefaultLoadingState />}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={cn(className)} role="status" aria-live="polite">
        {emptyNode ?? <DefaultEmptyState />}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={cn(className)} role="alert" aria-live="assertive">
        {errorNode ?? (
          <DefaultErrorState message={errorMessage} onRetry={onRetry} />
        )}
      </div>
    );
  }

  // success
  return <div className={cn(className)}>{children}</div>;
}

// ========== Default States ==========

export function DefaultLoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DefaultEmptyState({
  icon: Icon = Database,
  title = "Tidak ada data",
  description = "Data belum tersedia untuk ditampilkan saat ini.",
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-14 px-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        aria-hidden
      >
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 gap-1.5 bg-field text-field-foreground hover:opacity-90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function DefaultErrorState({
  message = "Terjadi kesalahan saat memuat data. Silakan coba beberapa saat lagi.",
  onRetry,
}: {
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-loss/30 bg-loss/5 py-14 px-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-loss/15 text-loss"
        aria-hidden
      >
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <p className="mt-4 font-semibold text-foreground">Gagal memuat data</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="mt-5 gap-1.5 border-loss/30 text-loss hover:bg-loss/10"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

export type { DataStatus };
