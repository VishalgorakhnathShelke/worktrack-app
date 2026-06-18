export interface DashboardMetric {
  label: string
  value: string
  detail: string
  accent?: string
}

interface StatCardProps {
  metric: DashboardMetric
}

export function StatCard({ metric }: StatCardProps) {
  return (
    <article className="min-h-28 border border-white/15 bg-[#0d0d0d] px-5 py-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/65">
        {metric.label}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
        <strong className="text-3xl font-black leading-none tracking-[-0.05em]">
          {metric.value}
        </strong>
        <span className="pb-0.5 font-mono text-[10px] text-white/60">
          {metric.accent && <span className="mr-2 text-emerald-400">{metric.accent}</span>}
          {metric.detail}
        </span>
      </div>
    </article>
  )
}
