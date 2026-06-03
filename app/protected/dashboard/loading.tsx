export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-ray"></div>
      <p className="ml-4 text-muted-foreground">Dein Dashboard lädt...</p>
    </div>
  );
}

// Route "/protected/dashboard": Uncached data or `connection()` was accessed outside of `<Suspense>`.
// This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route
