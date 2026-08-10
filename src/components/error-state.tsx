import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Error State Component
 * Shows structured error messages with recovery actions
 */

export type ErrorType = 
  | "not-found" 
  | "network-error" 
  | "server-error" 
  | "access-denied" 
  | "validation-error"
  | "unknown";

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  details?: string;
  onRetry?: () => void;
  showReportButton?: boolean;
  className?: string;
}

const errorConfig: Record<ErrorType, {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  defaultTitle: string;
  defaultDescription: string;
  accentColor: string;
  accentBg: string;
}> = {
  "not-found": {
    icon: AlertTriangle,
    defaultTitle: "Halaman tidak ditemukan",
    defaultDescription: "Halaman yang Anda cari tidak ada atau telah dihapus.",
    accentColor: "text-energetic-foreground",
    accentBg: "bg-energetic/15",
  },
  "network-error": {
    icon: AlertTriangle,
    defaultTitle: "Masalah koneksi jaringan",
    defaultDescription: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
    accentColor: "text-loss",
    accentBg: "bg-loss/15",
  },
  "server-error": {
    icon: AlertTriangle,
    defaultTitle: "Kesalahan server",
    defaultDescription: "Terjadi kesalahan di server kami. Tim kami telah diberitahu dan sedang menanganinya.",
    accentColor: "text-loss",
    accentBg: "bg-loss/15",
  },
  "access-denied": {
    icon: AlertTriangle,
    defaultTitle: "Akses ditolak",
    defaultDescription: "Anda tidak memiliki izin untuk mengakses halaman ini.",
    accentColor: "text-draw",
    accentBg: "bg-draw/15",
  },
  "validation-error": {
    icon: AlertTriangle,
    defaultTitle: "Data tidak valid",
    defaultDescription: "Silakan periksa kembali input Anda dan coba lagi.",
    accentColor: "text-energetic-foreground",
    accentBg: "bg-energetic/15",
  },
  "unknown": {
    icon: AlertTriangle,
    defaultTitle: "Terjadi kesalahan",
    defaultDescription: "Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
    accentColor: "text-muted-foreground",
    accentBg: "bg-muted",
  },
};

export function ErrorState({
  type = "unknown",
  title,
  description,
  details,
  onRetry,
  showReportButton = true,
  className,
}: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  return (
    <div className={cn("flex items-center justify-center min-h-96 p-4", className)}>
      <Card className="border-border w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className={cn("mx-auto w-12 h-12 rounded-xl flex items-center justify-center", config.accentBg)}>
              <Icon className={cn("w-6 h-6", config.accentColor)} aria-hidden />
            </div>

            {/* Title */}
            <h2 className="font-display text-xl font-semibold text-foreground">
              {displayTitle}
            </h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {displayDescription}
            </p>

            {/* Details (if provided) */}
            {details && (
              <div className="rounded-lg bg-card border border-border p-3 text-left">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {details}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="flex-1"
                    aria-label={`Coba lagi untuk ${displayTitle.toLowerCase()}`}
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden />
                    Coba Lagi
                  </Button>
                )}
                
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  aria-label="Kembali ke beranda"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-1.5" aria-hidden />
                    Beranda
                  </Link>
                </Button>
              </div>

              {showReportButton && type !== "validation-error" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  asChild
                >
                  <a href="mailto:support@bolaid.id" aria-label="Laporkan masalah ke dukungan">
                    <Mail className="w-4 h-4 mr-1.5" aria-hidden />
                    Laporkan Masalah
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Form Field Error Component
 * Shows validation error for form fields
 */
interface FormFieldErrorProps {
  message?: string;
  id?: string;
  className?: string;
}

export function FormFieldError({ message, id, className }: FormFieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      className={cn(
        "text-xs font-medium text-loss mt-1.5",
        className
      )}
      role="alert"
    >
      {message}
    </p>
  );
}

/**
 * Error Recovery Banner Component
 * Shows at top of page for recoverable errors
 */
interface ErrorBannerProps {
  title: string;
  description?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({
  title,
  description,
  onDismiss,
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-loss/30 bg-loss/5 p-4",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-loss mt-0.5 flex-shrink-0" aria-hidden />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-loss">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              aria-label="Coba lagi"
            >
              Coba Lagi
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              aria-label="Tutup pesan kesalahan"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Default Error State Component (used with DataState)
 */
export function DefaultErrorState() {
  return (
    <ErrorState
      type="unknown"
      title="Tidak dapat memuat data"
      description="Terjadi kesalahan saat memuat data. Silakan coba lagi."
    />
  );
}
