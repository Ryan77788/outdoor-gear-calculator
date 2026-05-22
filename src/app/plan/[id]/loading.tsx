function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

function InfoCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-3 h-5 w-28" />
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <SkeletonBlock className="h-[72px] w-[72px] shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-3 h-3 w-24" />
            </div>
            <SkeletonBlock className="h-7 w-28 rounded-full" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <SkeletonBlock className="h-4" />
            <SkeletonBlock className="h-4" />
            <SkeletonBlock className="h-4" />
          </div>
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export default function SharedPlanLoading() {
  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <div className="fixed right-4 top-4 z-50 rounded-full border border-white/70 bg-white/90 p-1 shadow-lg shadow-slate-900/10 backdrop-blur">
        <SkeletonBlock className="h-8 w-32 rounded-full" />
      </div>

      <section className="relative isolate overflow-hidden bg-slate-800">
        <div className="mx-auto flex min-h-[300px] max-w-6xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6">
          <SkeletonBlock className="h-9 w-44 rounded-full bg-white/25" />
          <SkeletonBlock className="mt-6 h-12 w-full max-w-2xl bg-white/25" />
          <SkeletonBlock className="mt-4 h-6 w-full max-w-xl bg-white/20" />
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-5 pb-12 sm:px-6">
        <div className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <InfoCardSkeleton key={index} />
            ))}
          </div>
        </div>

        <article className="mt-6 rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-emerald-950/10 backdrop-blur">
          <SkeletonBlock className="h-4 w-44" />
          <SkeletonBlock className="mt-3 h-8 w-64" />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-3xl" />
          <SkeletonBlock className="mt-2 h-4 w-full max-w-2xl" />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4" key={index}>
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </article>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <SkeletonBlock className="h-7 w-48" />
            <SkeletonBlock className="mt-3 h-4 w-64" />
            <div className="mt-5 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <ListItemSkeleton key={index} />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <SkeletonBlock className="h-7 w-56" />
            <SkeletonBlock className="mt-3 h-4 w-72" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/92 p-5 shadow-lg shadow-amber-950/5 ring-1 ring-white/70 backdrop-blur">
          <SkeletonBlock className="h-7 w-36 bg-amber-200/80" />
          <SkeletonBlock className="mt-3 h-4 w-52 bg-amber-200/70" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-xl border border-amber-200/70 bg-white/78 p-4 shadow-sm" key={index}>
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
