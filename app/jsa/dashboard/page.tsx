'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, Building2, FileText } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'

const RISK_COLORS: Record<string, string> = {
    '상': '#ef4444',
    '중': '#f59e0b',
    '하': '#10b981',
}

export default function JsaDashboardPage() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/jsa/records')
            .then(r => r.json())
            .then(d => setRecords(d.data || []))
            .finally(() => setLoading(false))
    }, [])

    // 이번 달 데이터
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - now.getDay())

    const thisMonthRecords = records.filter(r => r.created_at?.startsWith(thisMonth))
    const thisWeekRecords = records.filter(r => new Date(r.created_at) >= thisWeekStart)

    // 위험등급 분포 (전체)
    const gradeCounts = records.reduce((acc, r) => {
        const g = r.위험등급 || '미분류'
        acc[g] = (acc[g] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }))

    // 영업본부별 JSA 건수 (작업 그룹 기준)
    const grouped = records.reduce((acc, r) => {
        const key = `${r.작업명}__${r.매장명}__${r.created_at}`
        acc[key] = r.영업본부 || '미지정'
        return acc
    }, {} as Record<string, string>)

    const hqCounts = Object.values(grouped).reduce((acc: Record<string, number>, hq: any) => {
        acc[hq] = (acc[hq] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const barData = (Object.entries(hqCounts) as [string, number][])
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

    // 작업명별 위험등급 상 건수 (위험 TOP 5)
    const highRiskByWork = records
        .filter(r => r.위험등급 === '상')
        .reduce((acc, r) => {
            acc[r.작업명] = (acc[r.작업명] || 0) + 1
            return acc
        }, {} as Record<string, number>)

    const highRiskList = Object.entries(highRiskByWork)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)

    const statCard = (icon: React.ReactNode, label: string, value: string | number, color: string) => (
        <div className="card" style={{ padding: '1.25rem', flex: 1, minWidth: '140px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color }}>{icon}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.3) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '1.25rem 0',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/jsa" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>JSA 현황 대시보드</h1>
                </div>
            </div>

            <div className="container" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <>
                        {/* 통계 카드 */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {statCard(<FileText size={18} />, '전체 작성', Object.keys(grouped).length + '건', '#93c5fd')}
                            {statCard(<TrendingUp size={18} />, '이번 달', thisMonthRecords.length + '건', '#a78bfa')}
                            {statCard(<CheckCircle2 size={18} />, '이번 주', thisWeekRecords.length + '건', '#6ee7b7')}
                            {statCard(<AlertTriangle size={18} />, '위험(상) 건수', (gradeCounts['상'] || 0) + '건', '#fca5a5')}
                        </div>

                        {/* 영업본부별 JSA 현황 */}
                        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                                <Building2 size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
                                영업본부별 JSA 작성 건수
                            </h2>
                            {barData.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>데이터 없음</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 32, left: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            angle={-30}
                                            textAnchor="end"
                                            interval={0}
                                        />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                            itemStyle={{ color: '#93c5fd' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="작성건수" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* 위험등급 분포 + 위험 TOP5 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1.25rem' }}>
                                <h2 className="section-title" style={{ marginBottom: '1rem' }}>위험등급 분포</h2>
                                {pieData.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>데이터 없음</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={80}
                                                dataKey="value"
                                                label={(props: any) => {
                                                    const { name, percent } = props
                                                    return `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                                }}
                                                labelLine={false}
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={RISK_COLORS[entry.name] || '#64748b'}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                itemStyle={{ color: '#e2e8f0' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="card" style={{ padding: '1.25rem' }}>
                                <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.3rem', color: '#fca5a5' }} />
                                    위험(상) 많은 작업 TOP5
                                </h2>
                                {highRiskList.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>위험 등급 상 데이터 없음</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {(highRiskList as [string, number][]).map(([work, cnt], i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: i === 0 ? '#ef4444' : 'rgba(239,68,68,0.2)',
                                                    color: i === 0 ? 'white' : '#fca5a5',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                                                }}>{i + 1}</span>
                                                <span style={{ flex: 1, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{work}</span>
                                                <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.82rem' }}>{cnt}건</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
