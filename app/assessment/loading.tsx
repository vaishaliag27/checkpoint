/**
 * Loading UI for the assessment page — demonstrates the App Router
 * loading.tsx convention. Shown automatically while the Server Component
 * in page.tsx is resolving (including our simulated fetch delay).
 */

export default function AssessmentLoading() {
  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl animate-pulse space-y-8">
        <div className="flex justify-between border-b border-zinc-200 pb-6">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-zinc-200" />
            <div className="h-6 w-16 rounded bg-zinc-200" />
          </div>
          <div className="h-8 w-32 rounded bg-zinc-200" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-200" />
          <div className="h-2 w-full rounded-full bg-zinc-200" />
        </div>

        <div className="space-y-4">
          <div className="h-6 w-3/4 rounded bg-zinc-200" />
          <div className="h-4 w-full rounded bg-zinc-200" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-lg bg-zinc-200" />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-24 rounded-lg bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
