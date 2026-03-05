'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
    FileText, ShieldAlert, BarChart2, Activity
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from 'recharts'

// ─── 색상 상수 ──────────────────────────────────────────────
const GRADE_COLORS: Record<string, string> = {
    '상': '#ef4444', '중': '#f59e0b', '하': '#10b981', '미분류': '#64748b',
}
const CHART_PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#f97316', '#6366f1']

// ─── 커스텀 툴팁 ──────────────────────────────────────────────
const DarkTooltip = { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0' }, itemStyle: { color: '#93c5fd' }, labelStyle: { color: '#e2e8f0', fontWeight: 600 } }

// ─── 작은 통계 카드 ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${color}30`,
            borderRadius: '14px',
            padding: '1.25rem',
            flex: 1,
            minWidth: '130px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: '-10px', right: '-10px',
                width: '60px', height: '60px', borderRadius: '50%',
                background: `${color}15`,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <span style={{ color, opacity: 0.9 }}>{icon}</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>{sub}</div>}
        </div>
    )
}

// ─── 영업본부 진행률 카드 ──────────────────────────────────────────────
function HqProgressCard({ name, count, total, maxCount, gradeBreakdown }: {
    name: string; count: number; total: number; maxCount: number;
    gradeBreakdown: Record<string, number>;
}) {
    const pct = Math.round((count / Math.max(maxCount, 1)) * 100)
    const highRisk = gradeBreakdown['상'] || 0
    const riskColor = highRisk > 0 ? '#ef4444' : '#10b981'

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {highRisk > 0 && (
                        <span style={{
                            background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                            borderRadius: '999px', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                        }}>⚠ 위험 {highRisk}건</span>
                    )}
                    <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.9rem' }}>{count}건</span>
                </div>
            </div>

            {/* 프로그레스 바 */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '999px',
                    background: highRisk > 0
                        ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                        : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                    transition: 'width 0.8s ease',
                }} />
            </div>

            {/* 등급별 미니 배지 */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(['상', '중', '하'] as const).map(g => {
                    const cnt = gradeBreakdown[g] || 0
                    if (!cnt) return null
                    return (
                        <span key={g} style={{
                            background: `${GRADE_COLORS[g]}20`,
                            color: GRADE_COLORS[g],
                            borderRadius: '999px', padding: '0.1rem 0.45rem',
                            fontSize: '0.68rem', fontWeight: 600,
                        }}>{g} {cnt}</span>
                    )
                })}
            </div>
        </div>
    )
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function JsaDashboardPage() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'month' | 'all'>('month')

    useEffect(() => {
        fetch('/api/jsa/records')
            .then(r => r.json())
            .then(d => setRecords(d.data || []))
            .finally(() => setLoading(false))
    }, [])

    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = (() => {
        const d = new Date(now); d.setMonth(d.getMonth() - 1)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })()

    const filteredRecords = viewMode === 'month'
        ? records.filter(r => r.created_at?.startsWith(thisMonth))
        : records

    const stats = useMemo(() => {
        // JSA 그룹 (작업 단위)
        const groups = new Map<string, any>()
        filteredRecords.forEach(r => {
            const key = `${r.작업명}__${r.매장명}__${r.created_at}`
            if (!groups.has(key)) groups.set(key, r)
        })
        const groupArr = Array.from(groups.values())

        // 영업본부별 집계
        const hqMap = new Map<string, { count: number; grades: Record<string, number> }>()
        groupArr.forEach(r => {
            const hq = r.영업본부 || '미지정'
            const ex = hqMap.get(hq) || { count: 0, grades: {} }
            ex.count++
            const g = r.위험등급 || '미분류'
            ex.grades[g] = (ex.grades[g] || 0) + 1
            hqMap.set(hq, ex)
        })
        const hqList = Array.from(hqMap.entries())
            .sort(([, a], [, b]) => b.count - a.count)
        const hqMaxCount = Math.max(...hqList.map(([, v]) => v.count), 1)

        // 위험등급 분포 (row 단위)
        const gradeCounts: Record<string, number> = {}
        filteredRecords.forEach(r => {
            const g = r.위험등급 || '미분류'
            gradeCounts[g] = (gradeCounts[g] || 0) + 1
        })
        const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }))

        // 유해위험요인 키워드 집계
        const keywordMap = new Map<string, number>()
        filteredRecords.forEach(r => {
            const text: string = r.유해위험요인 || ''
            if (!text) return
            // 간단한 어절 분리 (2자 이상)
            text.split(/[\s,./·]+/).forEach(word => {
                const w = word.trim()
                if (w.length >= 3) keywordMap.set(w, (keywordMap.get(w) || 0) + 1)
            })
        })
        const keywordList = Array.from(keywordMap.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)

        // 위험유형(카테고리) 집계
        const typeCounts: Record<string, number> = {}
        filteredRecords.forEach(r => {
            const t = r.유형 || '기타'
            typeCounts[t] = (typeCounts[t] || 0) + 1
        })
        const typeBar = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([name, count]) => ({ name, count }))

        // 월별 트렌드 (최근 6개월)
        const monthlyMap: Record<string, number> = {}
        records.forEach(r => {
            if (!r.created_at) return
            const m = r.created_at.slice(0, 7)
            monthlyMap[m] = (monthlyMap[m] || 0) + 1
        })
        const months: string[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now); d.setMonth(d.getMonth() - i)
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
        }
        const trendData = months.map(m => ({
            month: m.slice(5) + '월',
            count: monthlyMap[m] || 0,
        }))

        const highRiskCount = gradeCounts['상'] || 0
        const lastMonthCount = records.filter(r => r.created_at?.startsWith(lastMonth)).length

        return { groups: groupArr, hqList, hqMaxCount, pieData, keywordList, typeBar, trendData, highRiskCount, lastMonthCount }
    }, [filteredRecords, records])

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.25) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '1.25rem 0',
                position: 'sticky', top: 0, zIndex: 100,
                backdropFilter: 'blur(12px)',
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/jsa" style={{ color: '#64748b', display: 'flex' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '1.15rem', fontWeight: 800 }}>JSA 현황 대시보드</h1>
                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>안전관리 종합 현황</p>
                        </div>
                    </div>
                    {/* 기간 토글 */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                        {(['month', 'all'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{
                                padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem',
                                border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                                background: viewMode === v ? '#3b82f6' : 'transparent',
                                color: viewMode === v ? 'white' : '#94a3b8',
                            }}>
                                {v === 'month' ? '이번 달' : '전체'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '1.5rem', maxWidth: '900px' }}>

                {/* ── 상단 통계 카드 ── */}
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <StatCard icon={<FileText size={16} />} label="작성 건수" value={stats.groups.length} sub={viewMode === 'month' ? '이번 달' : '전체 누계'} color="#3b82f6" />
                    <StatCard icon={<Activity size={16} />} label="평가 단계 수" value={filteredRecords.length} color="#8b5cf6" />
                    <StatCard icon={<AlertTriangle size={16} />} label="위험(상) 건수" value={stats.highRiskCount} sub="즉시 조치 필요" color="#ef4444" />
                    <StatCard icon={<CheckCircle2 size={16} />} label="전월 대비" value={`+${stats.groups.length - stats.lastMonthCount}`} sub="JSA 작성 증감" color="#10b981" />
                </div>

                {/* ── 영업본부별 진행 현황 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BarChart2 size={16} color="#3b82f6" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>영업본부별 JSA 진행 현황</h2>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto' }}>
                            {viewMode === 'month' ? `${thisMonth.slice(5)}월` : '전체'} 기준
                        </span>
                    </div>
                    {stats.hqList.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>데이터 없음</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {stats.hqList.map(([name, { count, grades }]) => (
                                <HqProgressCard
                                    key={name} name={name} count={count}
                                    total={stats.groups.length}
                                    maxCount={stats.hqMaxCount}
                                    gradeBreakdown={grades}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 월별 트렌드 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TrendingUp size={16} color="#8b5cf6" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>JSA 작성 추이 (최근 6개월)</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={stats.trendData}>
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip {...DarkTooltip} />
                            <Bar dataKey="count" name="작성 건수" radius={[5, 5, 0, 0]}
                                fill="url(#barGrad)" />
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ── 위험등급 분포 + 위험유형 ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* 위험등급 도넛 */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '1.25rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <ShieldAlert size={15} color="#f59e0b" />
                            <h2 style={{ fontWeight: 700, fontSize: '0.9rem' }}>위험등급 분포</h2>
                        </div>
                        {stats.pieData.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>데이터 없음</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}
                                            label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {stats.pieData.map((e, i) => <Cell key={i} fill={GRADE_COLORS[e.name] || '#64748b'} />)}
                                        </Pie>
                                        <Tooltip {...DarkTooltip} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    {stats.pieData.map(e => (
                                        <span key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GRADE_COLORS[e.name] || '#64748b' }} />
                                            {e.name} {e.value}건
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 위험유형 바차트 */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '1.25rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <AlertTriangle size={15} color="#ef4444" />
                            <h2 style={{ fontWeight: 700, fontSize: '0.9rem' }}>위험 유형별 집계</h2>
                        </div>
                        {stats.typeBar.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>AI 분석 후 표시됩니다</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={stats.typeBar} layout="vertical" margin={{ left: 8 }}>
                                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={68} />
                                    <Tooltip {...DarkTooltip} />
                                    <Bar dataKey="count" name="건수" radius={[0, 4, 4, 0]}>
                                        {stats.typeBar.map((_, i) => (
                                            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── 위험 키워드 TOP 10 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '1.25rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShieldAlert size={15} color="#ef4444" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>주요 유해위험요인 TOP 10</h2>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto' }}>발생 빈도 기준</span>
                    </div>
                    {stats.keywordList.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>AI 분석 실행 후 집계됩니다</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                            {stats.keywordList.map(([kw, cnt], i) => {
                                const maxCnt = stats.keywordList[0]?.[1] ?? 1
                                const barPct = Math.round((cnt / maxCnt) * 100)
                                const isTop = i < 3
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                            background: isTop ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: isTop ? '#fca5a5' : '#64748b',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.68rem', fontWeight: 700,
                                        }}>{i + 1}</span>
                                        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, height: '100%',
                                                width: `${barPct}%`, borderRadius: '4px',
                                                background: isTop ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.1)',
                                            }} />
                                            <div style={{ position: 'relative', padding: '0.2rem 0.4rem', fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {kw}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isTop ? '#fca5a5' : '#64748b', flexShrink: 0 }}>{cnt}회</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
