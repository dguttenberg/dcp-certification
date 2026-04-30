'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isDemo, generateMockAdminData, type MockAdminUser } from '@/lib/demo-store'
import {
  Users,
  Award,
  Clock,
  AlertCircle,
  Download,
  ChevronUp,
  ChevronDown,
  Filter,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortKey =
  | 'full_name'
  | 'email'
  | 'agency'
  | 'sections_completed'
  | 'quiz_passed'
  | 'last_activity'
type SortDir = 'asc' | 'desc'
type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'completed'

function formatDate(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const { user, loading } = useAuth()
  const [data, setData] = useState<MockAdminUser[]>([])
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('full_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user || user.role !== 'admin') return

    let cancelled = false

    if (isDemo()) {
      setData(generateMockAdminData())
      return
    }

    ;(async () => {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (!cancelled) {
            setFetchError(body.error ?? `Failed to load (${res.status}).`)
          }
          return
        }
        const body = await res.json()
        if (cancelled) return
        setData(body.users ?? [])
      } catch (err) {
        console.error('Admin fetch error:', err)
        if (!cancelled) setFetchError('Network error.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loading, user])

  // ---- Access gate ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-aurora-violet/30 border-t-aurora-violet" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ember/15 border-2 border-ember flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-ember" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-midnight mb-2">Access Denied</h1>
          <p className="text-surface-700">
            You do not have permission to view this page. Admin access is required.
          </p>
        </div>
      </div>
    )
  }

  // ---- Stats ----
  const stats = {
    total: data.length,
    completed: data.filter((u) => u.status === 'completed').length,
    inProgress: data.filter((u) => u.status === 'in-progress').length,
    notStarted: data.filter((u) => u.status === 'not-started').length,
  }

  // ---- Filter & sort ----
  const filtered = data
    .filter((u) => {
      if (agencyFilter !== 'all' && u.agency !== agencyFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      const key = sortKey
      if (key === 'full_name' || key === 'email' || key === 'agency') {
        cmp = a[key].localeCompare(b[key])
      } else if (key === 'sections_completed') {
        cmp = a.sections_completed - b.sections_completed
      } else if (key === 'quiz_passed') {
        cmp = Number(a.quiz_passed) - Number(b.quiz_passed)
      } else if (key === 'last_activity') {
        const aDate = a.last_activity ?? ''
        const bDate = b.last_activity ?? ''
        cmp = aDate.localeCompare(bDate)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column)
      return <ChevronUp className="w-3 h-3 text-surface-300 inline ml-1" />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-aurora-violet inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-aurora-violet inline ml-1" />
    )
  }

  // ---- CSV Export ----
  function handleExport() {
    const headers = [
      'Name',
      'Email',
      'Agency',
      'Sections Complete',
      'Quiz Passed',
      'Status',
      'Completion Date',
    ]
    const rows = filtered.map((u) => [
      u.full_name,
      u.email,
      u.agency,
      `${u.sections_completed}/${u.total_sections}`,
      u.quiz_passed ? 'Yes' : 'No',
      u.status,
      u.last_activity ? formatDate(u.last_activity) : '',
    ])
    const csv =
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
        '\n'
      )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `dcp-certification-report-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ---- Stat card helper ----
  const statCards: {
    label: string
    value: number
    icon: typeof Users
    color: string
    bg: string
  }[] = [
    {
      label: 'Total Enrolled',
      value: stats.total,
      icon: Users,
      color: 'text-aurora-violet',
      bg: 'bg-aurora-violet/10',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: Award,
      color: 'text-accent-700',
      bg: 'bg-aurora-green/15',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-ember',
      bg: 'bg-ember/10',
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
      icon: AlertCircle,
      color: 'text-surface-500',
      bg: 'bg-surface-100',
    },
  ]

  return (
    <div className="min-h-screen bg-offwhite">
      {/* DCP header strip */}
      <header className="bg-midnight border-b border-aurora-green/10 px-6 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="dcp-logo">
            <span className="dcp-logo-mark">DCP</span>
            <span className="dcp-logo-wordmark">Doner<br />Colle<br />Partners.</span>
          </div>
          <span className="hidden sm:block text-[11px] font-bold tracking-[0.2em] uppercase text-aurora-green/80">
            Admin
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <span className="dcp-eyebrow">Admin Dashboard</span>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold uppercase tracking-tight text-midnight">
              Certification Progress
            </h1>
            <p className="text-surface-700 mt-2">
              DCP AI Foundations Certification overview.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="dcp-btn-primary"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-midnight">{card.value}</p>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-surface-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {fetchError && (
          <div className="mb-6 rounded-xl border border-ember/40 bg-ember/10 p-4 text-sm text-ember">
            {fetchError}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm mb-6 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-aurora-violet">
              <Filter className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Filters</span>
            </div>
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="text-sm border border-surface-300 rounded-lg px-3 py-2 text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-aurora-violet/30 focus:border-aurora-violet"
            >
              <option value="all">All Agencies</option>
              <option value="Doner">Doner</option>
              <option value="Colle McVoy">Colle McVoy</option>
              <option value="DCP">DCP</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm border border-surface-300 rounded-lg px-3 py-2 text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-aurora-violet/30 focus:border-aurora-violet"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <span className="text-xs text-surface-500 ml-auto">
              {filtered.length} of {data.length} users
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-aurora-green bg-midnight">
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('full_name')}
                  >
                    Name <SortIcon column="full_name" />
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('email')}
                  >
                    Email <SortIcon column="email" />
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('agency')}
                  >
                    Agency <SortIcon column="agency" />
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('sections_completed')}
                  >
                    Sections <SortIcon column="sections_completed" />
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('quiz_passed')}
                  >
                    Passed <SortIcon column="quiz_passed" />
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-[10px] font-bold tracking-[0.15em] uppercase text-aurora-green cursor-pointer select-none whitespace-nowrap"
                    onClick={() => toggleSort('last_activity')}
                  >
                    Completion Date <SortIcon column="last_activity" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-surface-100 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-surface-50/50'
                    } hover:bg-aurora-violet/5 transition-colors`}
                  >
                    <td className="px-4 py-3 font-semibold text-midnight whitespace-nowrap">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 text-surface-700 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-surface-700 whitespace-nowrap">
                      {u.agency}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-surface-700 tabular-nums">
                        {u.sections_completed}/{u.total_sections}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.quiz_passed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase bg-aurora-green/15 text-accent-800 border border-aurora-green/30">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase bg-surface-100 text-surface-500 border border-surface-200">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-surface-700 whitespace-nowrap">
                      {u.status === 'completed' ? formatDate(u.last_activity) : '--'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-surface-400"
                    >
                      No users match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
