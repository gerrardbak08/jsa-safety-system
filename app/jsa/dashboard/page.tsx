'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2,
    FileText, ShieldAlert, BarChart2, Activity, Building2,
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'
import { ORG_RAW_DATA } from '@/lib/org-data'

// ─── 색상 ──────────────────────────────────────────────
const GRADE_COLORS: Record<string, string> = {
    '상': '#ef4444', '중': '#f59e0b', '하': '#10b981', '미분류': '#64748b',
}
const PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#f97316', '#6366f1']
const DT = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0' },
    itemStyle: { color: '#93c5fd' },
    labelStyle: { color: '#e2e8f0', fontWeight: 600 },
}

// ─── 부서별 전체 매장 수 (org-data 기준) ──────────────────────────────────────────────
const DEPT_TOTAL_STORES: Record<string, number> = (() => {
    const map: Record<string, Set<string>> = {}
    for (const [, 부서명, , 매장명] of ORG_RAW_DATA) {
        if (!map[부서명]) map[부서명] = new Set()
        map[부서명].add(매장명)
    }
    const result: Record<string, number> = {}
    for (const [dept, stores] of Object.entries(map)) result[dept] = stores.size
    return result
})()

// ─── 통계 카드 ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string
}) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30`,
            borderRadius: '14px', padding: '1.15rem', flex: 1, minWidth: '130px',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '55px', height: '55px', borderRadius: '50%', background: `${color}15` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ color, opacity: 0.9 }}>{icon}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.25rem' }}>{sub}</div>}
        </div>
    )
}

// ─── 부서별 진행률 카드 ──────────────────────────────────────────────
function DeptProgressCard({ dept, submittedStores, totalStores, gradeBreakdown, jsaCount }: {
    dept: string; submittedStores: number; totalStores: number;
    gradeBreakdown: Record<string, number>; jsaCount: number;
}) {
    const pct = totalStores > 0 ? Math.round((submittedStores / totalStores) * 100) : 0
    const highRisk = gradeBreakdown['상'] || 0
    const isHigh = highRisk > 0

    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '0.9rem 1.1rem', transition: 'border-color 0.2s',
        }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
            {/* 상단 행 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                    {dept}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {isHigh && (
                        <span style={{
                            background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                            borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.67rem', fontWeight: 600,
                        }}>⚠ 위험 {highRisk}</span>
                    )}
                    <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.82rem' }}>{jsaCount}건</span>
                </div>
            </div>

            {/* 프로그레스 바 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: '999px', transition: 'width 0.8s ease',
                        background: isHigh
                            ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                            : pct >= 50
                                ? 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pct >= 50 ? '#60a5fa' : '#a78bfa', flexShrink: 0, minWidth: '40px', textAlign: 'right' }}>
                    {pct}%
                </span>
            </div>

            {/* 하단: 매장 제출 현황 + 위험등급 배지 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.67rem', color: '#64748b' }}>
                    {submittedStores}개 매장 / 전체 {totalStores}개
                </span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {(['상', '중', '하'] as const).map(g => {
                        const cnt = gradeBreakdown[g] || 0
                        return cnt > 0 ? (
                            <span key={g} style={{
                                background: `${GRADE_COLORS[g]}20`, color: GRADE_COLORS[g],
                                borderRadius: '999px', padding: '0.08rem 0.38rem', fontSize: '0.65rem', fontWeight: 600,
                            }}>{g}{cnt}</span>
                        ) : null
                    })}
                </div>
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

    const filtered = viewMode === 'month'
        ? records.filter(r => r.created_at?.startsWith(thisMonth))
        : records

    const stats = useMemo(() => {
        // JSA 그룹 (매장+작업+날짜 단위)
        const groupMap = new Map<string, any>()
        filtered.forEach(r => {
            const key = `${r.작업명}__${r.매장명}__${r.created_at}`
            if (!groupMap.has(key)) groupMap.set(key, r)
        })
        const groups = Array.from(groupMap.values())

        // ── 부서별 집계 ──
        // 제출된 매장명 Set (부서별)
        const deptSubmittedStores = new Map<string, Set<string>>()
        const deptGrades = new Map<string, Record<string, number>>()
        const deptJsaCount = new Map<string, number>()

        groups.forEach(r => {
            const dept = r.부서명 || '미지정'
            if (!deptSubmittedStores.has(dept)) deptSubmittedStores.set(dept, new Set())
            deptSubmittedStores.get(dept)!.add(r.매장명)

            const grades = deptGrades.get(dept) || {}
            const g = r.위험등급 || '미분류'
            grades[g] = (grades[g] || 0) + 1
            deptGrades.set(dept, grades)

            deptJsaCount.set(dept, (deptJsaCount.get(dept) || 0) + 1)
        })

        // 부서 목록 정렬 (JSA 건수 내림차순)
        const deptList = Array.from(deptSubmittedStores.keys())
            .sort((a, b) => (deptJsaCount.get(b) || 0) - (deptJsaCount.get(a) || 0))

        // ── 위험등급 분포 (row 단위) ──
        const gradeCounts: Record<string, number> = {}
        filtered.forEach(r => {
            const g = r.위험등급 || '미분류'
            gradeCounts[g] = (gradeCounts[g] || 0) + 1
        })
        const pieData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }))

        // ── 유해위험요인: 줄/구분자 기준으로 전체 문구 단위 집계 ──
        // 줄바꿈, 번호표(1. 2. 등), 특수구분자로만 split → 단어 분리 안 함
        const phraseMap = new Map<string, number>()
        filtered.forEach(r => {
            const text: string = r.유해위험요인 || ''
            if (!text) return
            // 줄바꿈 / 번호매기기 / 세미콜론 기준 분리
            text.split(/[\n\r;]+/).forEach(seg => {
                const phrase = seg.replace(/^\s*\d+[.)\-]\s*/, '').trim()
                if (phrase.length >= 4) {
                    phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1)
                }
            })
        })
        const keywordList = Array.from(phraseMap.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)

        // ── 위험유형별 집계 ──
        const typeCounts: Record<string, number> = {}
        filtered.forEach(r => {
            const t = r.유형 || '기타'
            typeCounts[t] = (typeCounts[t] || 0) + 1
        })
        const typeBar = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a).slice(0, 8)
            .map(([name, count]) => ({ name, count }))

        // ── 월별 트렌드 ──
        const monthlyMap: Record<string, number> = {}
        records.forEach(r => {
            if (!r.created_at) return
            const m = r.created_at.slice(0, 7)
            monthlyMap[m] = (monthlyMap[m] || 0) + 1
        })
        const trendData = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now); d.setMonth(d.getMonth() - (5 - i))
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return { month: m.slice(5) + '월', count: monthlyMap[m] || 0 }
        })

        const lastMonthCount = records.filter(r => r.created_at?.startsWith(lastMonth)).length

        return {
            groups, deptList, deptSubmittedStores, deptGrades, deptJsaCount,
            pieData, keywordList, typeBar, trendData,
            highRiskCount: gradeCounts['상'] || 0, lastMonthCount,
        }
    }, [filtered, records])

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* 헤더 */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.2) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '1.15rem 0', position: 'sticky', top: 0, zIndex: 100,
                backdropFilter: 'blur(12px)',
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <Link href="/jsa" style={{ color: '#64748b', display: 'flex' }}><ArrowLeft size={20} /></Link>
                        <div>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 800 }}>JSA 현황 대시보드</h1>
                            <p style={{ fontSize: '0.68rem', color: '#64748b' }}>안전관리 종합 현황</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
                        {(['month', 'all'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{
                                padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem',
                                border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                                background: viewMode === v ? '#3b82f6' : 'transparent',
                                color: viewMode === v ? 'white' : '#94a3b8',
                            }}>{v === 'month' ? '이번 달' : '전체'}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '1.25rem', maxWidth: '920px' }}>

                {/* ── 통계 카드 ── */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <StatCard icon={<FileText size={15} />} label="JSA 작성 건수" value={stats.groups.length} sub={viewMode === 'month' ? '이번 달' : '전체'} color="#3b82f6" />
                    <StatCard icon={<Activity size={15} />} label="평가 단계 수" value={filtered.length} color="#8b5cf6" />
                    <StatCard icon={<AlertTriangle size={15} />} label="위험(상)" value={stats.highRiskCount} sub="즉시 조치 필요" color="#ef4444" />
                    <StatCard icon={<CheckCircle2 size={15} />} label="전월 대비" value={`+${stats.groups.length - stats.lastMonthCount}`} sub="JSA 작성 증감" color="#10b981" />
                </div>

                {/* ── 영업부서별 진행 현황 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '1.15rem', marginBottom: '1.15rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                        <Building2 size={15} color="#3b82f6" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.92rem' }}>영업부서별 JSA 진행 현황</h2>
                        <span style={{ fontSize: '0.68rem', color: '#475569', marginLeft: 'auto' }}>
                            매장 제출률 = JSA 제출 매장 수 / 부서 전체 매장 수
                        </span>
                    </div>
                    {stats.deptList.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>데이터 없음</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {stats.deptList.map(dept => {
                                const submittedSet = stats.deptSubmittedStores.get(dept)!
                                const total = DEPT_TOTAL_STORES[dept] || submittedSet.size
                                return (
                                    <DeptProgressCard
                                        key={dept}
                                        dept={dept}
                                        submittedStores={submittedSet.size}
                                        totalStores={total}
                                        gradeBreakdown={stats.deptGrades.get(dept) || {}}
                                        jsaCount={stats.deptJsaCount.get(dept) || 0}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ── 월별 트렌드 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '1.15rem', marginBottom: '1.15rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <TrendingUp size={15} color="#8b5cf6" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.92rem' }}>JSA 작성 추이 (최근 6개월)</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={stats.trendData}>
                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip {...DT} />
                            <defs>
                                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                            <Bar dataKey="count" name="작성 건수" radius={[5, 5, 0, 0]} fill="url(#barG)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ── 위험등급 + 위험유형 ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.15rem', marginBottom: '1.15rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                            <ShieldAlert size={14} color="#f59e0b" />
                            <h2 style={{ fontWeight: 700, fontSize: '0.88rem' }}>위험등급 분포</h2>
                        </div>
                        {stats.pieData.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.82rem' }}>데이터 없음</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={145}>
                                    <PieChart>
                                        <Pie data={stats.pieData} cx="50%" cy="50%"
                                            innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={3}
                                            label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {stats.pieData.map((e, i) => <Cell key={i} fill={GRADE_COLORS[e.name] || '#64748b'} />)}
                                        </Pie>
                                        <Tooltip {...DT} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                    {stats.pieData.map(e => (
                                        <span key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', fontSize: '0.7rem' }}>
                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GRADE_COLORS[e.name] || '#64748b' }} />
                                            {e.name} {e.value}건
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                            <AlertTriangle size={14} color="#ef4444" />
                            <h2 style={{ fontWeight: 700, fontSize: '0.88rem' }}>위험 유형별 집계</h2>
                        </div>
                        {stats.typeBar.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', fontSize: '0.82rem' }}>AI 분석 후 표시됩니다</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={175}>
                                <BarChart data={stats.typeBar} layout="vertical">
                                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={62} />
                                    <Tooltip {...DT} />
                                    <Bar dataKey="count" name="건수" radius={[0, 4, 4, 0]}>
                                        {stats.typeBar.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── 주요 유해위험요인 TOP 10 ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px', padding: '1.15rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                        <ShieldAlert size={15} color="#ef4444" />
                        <h2 style={{ fontWeight: 700, fontSize: '0.92rem' }}>주요 유해위험요인 TOP 10</h2>
                        <span style={{ fontSize: '0.68rem', color: '#475569', marginLeft: 'auto' }}>발생 빈도 기준</span>
                    </div>
                    {stats.keywordList.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>AI 분석 실행 후 집계됩니다</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {stats.keywordList.map(([phrase, cnt], i) => {
                                const maxCnt = stats.keywordList[0]?.[1] ?? 1
                                const barPct = Math.round((cnt / maxCnt) * 100)
                                const isTop3 = i < 3
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <span style={{
                                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                            background: isTop3 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: isTop3 ? '#fca5a5' : '#64748b',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.67rem', fontWeight: 700,
                                        }}>{i + 1}</span>
                                        <div style={{ flex: 1, position: 'relative', minWidth: 0, borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{
                                                position: 'absolute', inset: 0, width: `${barPct}%`,
                                                background: isTop3 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)',
                                                borderRadius: '5px',
                                            }} />
                                            <div style={{
                                                position: 'relative', padding: '0.25rem 0.5rem',
                                                fontSize: '0.82rem', fontWeight: 500,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {phrase}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 700,
                                            color: isTop3 ? '#fca5a5' : '#64748b',
                                            flexShrink: 0, minWidth: '26px', textAlign: 'right',
                                        }}>{cnt}회</span>
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
