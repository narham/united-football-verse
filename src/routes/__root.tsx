import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ErrorState } from "@/components/error-state";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <ErrorState 
        type="not-found"
        title="Halaman tidak ditemukan"
        description="Halaman yang Anda cari tidak ada atau telah dipindahkan."
        showReportButton={false}
      />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
  const errorType = isNetworkError ? "network-error" : "server-error";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <ErrorState 
        type={errorType}
        title={isNetworkError ? "Masalah koneksi jaringan" : "Kesalahan server"}
        description={isNetworkError 
          ? "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
          : "Terjadi kesalahan di sisi kami. Tim kami telah diberitahu dan sedang menanganinya."}
        onRetry={() => {
          router.invalidate();
          reset();
        }}
        showReportButton
      />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "bolaID — Football OS" },
      { name: "description", content: "bolaID Football OS — platform manajemen SSB & klub sepak bola. Kelola pemain, latihan, kompetisi, dan keuangan dalam satu ekosistem." },
      { property: "og:title", content: "bolaID — Football OS" },
      { property: "og:description", content: "Platform manajemen SSB & klub sepak bola. One Identity. One Journey. One Football Ecosystem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
