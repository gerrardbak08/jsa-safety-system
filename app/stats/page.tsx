'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend
} from 'recharts'
import { AlertTriangle, HardHat, TrendingUp, Users } from 'lucide-react'
import type { AccidentRecord, AccidentStatsResponse } from '@/app/stats/types'

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366f1', '#14b8a6']

export default function StatsDashboard() {
  const [data, setData] = useState<AccidentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as AccidentStatsResponse

        if (json.error) {
          setErrorMsg(json.error)
        }
        setData(json.data || [])
      } catch (e: any) {
        setErrorMsg('통계 데이터를 불러오는데 실패했습니다.')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Process data for charts
  const { totalAccidents, deptData, teamData, typeData, ageData } = useMemo(() => {
    if (!data.length) return { totalAccidents: 0, deptData: [], teamData: [], typeData: [], ageData: [] }

    const deptMap: Record<string, number> = {}
    const teamMap: Record<string, number> = {}
    const typeMap: Record<string, number> = {}
    const ageMap: Record<string, number> = {}

    data.forEach((r) => {
      // 영업부
      const dept = r.department?.trim() || '미분류'
      deptMap[dept] = (deptMap[dept] || 0) + 1

      // 팀명
      const team = r.team?.trim() || '미분류'
      teamMap[team] = (teamMap[team] || 0) + 1

      // 재해 유형
      const accType = r.accidentType?.trim() || '미분류'
      typeMap[accType] = (typeMap[accType] || 0) + 1

      // 연령대
      let age = r.ageGroup?.trim() || '미분류'
      ageMap[age] = (ageMap[age] || 0) + 1
    })

    const chartify = (map: Record<string, number>, sort = true, maxRecords = 10) => {
      let arr = Object.entries(map).map(([name, value]) => ({ name, value }))
      if (sort) arr = arr.sort((a, b) => b.value - a.value)
      return arr.slice(0, maxRecords)
    }

    return {
      totalAccidents: data.length,
      deptData: chartify(deptMap),
      teamData: chartify(teamMap, true, 20), // Top 20 Teams
      typeData: chartify(typeMap),
      ageData: chartify(ageMap, false), // Sort by age string could be tricky depending on data format, let's sort by value for now
    }
  }, [data])

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: 'var(--text-primary)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            사고 인원: <span style={{ color: payload[0].fill, fontWeight: 'bold' }}>{payload[0].value}건</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-dark)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
          <p className="text-[var(--text-secondary)]">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
            <HardHat className="h-6 w-6 text-[var(--accent)]" />
            <a href="/">JSA Safety System</a>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">
              전국산업재해 통계 현황 (가명화 데이터)
            </span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">사고 발생 통계 대시보드</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            전국 산업재해 조사 보고서 데이터를 기반으로 부서, 팀, 재해유형, 연령대별 사고 현황을 분석합니다.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--bg-elevated)] rounded-lg">
                <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-[var(--text-secondary)] font-medium">조사된 총 사고</h3>
            </div>
            <div className="text-4xl font-bold text-[var(--text-primary)] pl-1">{totalAccidents.toLocaleString()}<span className="text-lg text-[var(--text-secondary)] ml-1 font-normal">건</span></div>
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--bg-elevated)] rounded-lg">
                <HardHat className="h-5 w-5 text-pink-500" />
              </div>
              <h3 className="text-[var(--text-secondary)] font-medium">최다 사고 발생팀</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] pl-1">{teamData[0]?.name || '-'}</div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--bg-elevated)] rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-[var(--text-secondary)] font-medium">주요 재해 유형</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] pl-1">{typeData[0]?.name || '-'}</div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--bg-elevated)] rounded-lg">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-[var(--text-secondary)] font-medium">취약 연령대</h3>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] pl-1">{ageData[0]?.name || '-'}</div>
          </div>
        </div>

        {/* Charts Row 1: Dept & TYPE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2 h-6 bg-[var(--accent)] rounded-full"></span>
              영업부별 발생 건수 (Top 10)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2 h-6 bg-pink-500 rounded-full"></span>
              재해 유형별 분포
            </h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'var(--text-secondary)' }}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Team & Age */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              팀별 발생 건수 (Top 20)
            </h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              연령대별 발생 건수
            </h2>
            <div className="h-[350px] w-full flex flex-col justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData.sort((a,b) => a.name.localeCompare(b.name))} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)' }} />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
