import { RecorderCard } from '../components/RecorderCard'
import { StatCard, type DashboardMetric } from '../components/StatCard'

const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Workflows recorded',
    value: '1,284',
    accent: '+12%',
    detail: 'this month'
  },
  {
    label: 'SOPs generated',
    value: '412',
    detail: 'Auto-validated'
  },
  {
    label: 'Active teams',
    value: '18',
    detail: 'Across 4 depts'
  },
  {
    label: 'Avg. completion time',
    value: '4m 12s',
    detail: '-0.4s improvement'
  }
]

export function DashboardPage() {
  return (
    <section className="px-5 py-6 md:px-8">
       <RecorderCard />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </div>
     
    </section>
  )
}
