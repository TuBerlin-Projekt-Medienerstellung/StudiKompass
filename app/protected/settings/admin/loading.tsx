export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      <p className="ml-4 text-zinc-500">Checking Admin privileges..</p>
    </div>
  );
}