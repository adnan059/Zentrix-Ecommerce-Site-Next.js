// src/components/shared/not-found-ui.tsx
interface NotFoundUIProps {
  title?: string;
  message?: string;
  backLabel?: string;
  backHref?: string;
}

export function NotFoundUI({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  backLabel = "Go Home",
  backHref = "/",
}: NotFoundUIProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-7xl font-black tracking-tighter text-muted-foreground/20">
        404
      </p>
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">{message}</p>
      <a
        href={backHref}
        className="inline-flex h-10 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-80"
      >
        {backLabel}
      </a>
    </div>
  );
}
