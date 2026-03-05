'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Calendar, User, Building2, AlertTriangle, ChevronRight, Download } from 'lucide-react'
import { JsaRecord } from '@/lib/supabase'

export default function JsaHistoryPage() {
    const [records, setRecords] = useState<JsaRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterGrade, setFilterGrade] = useState('')

    useEffect(() => { fetchAll() }, [])

    async function fetchAll() {
        try {
            const res = await fetch('/api/jsa/records')
            const data = await res.json()
            setRecords(data.data || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const grouped = records.reduce((acc, r) => {
        const key = `${r.작업명}__${r.매장명}__${r.created_at}`
        if (!acc[key]) acc[key] = { ...r, steps: [r] }
        else acc[key].steps.push(r)
        return acc
    }, {} as Record<string, any>)

    const groupedList = Object.values(grouped)

    const filtered = groupedList.filter((g: any) => {
        const matchSearch = !search ||
            g.매장명?.toLowerCase().includes(search.toLowerCase()) ||
            g.작업명?.toLowerCase().includes(search.toLowerCase()) ||
            g.작성자?.toLowerCase().includes(search.toLowerCase())
        const matchGrade = !filterGrade || g.위험등급 === filterGrade
        return matchSearch && matchGrade
    })

    const riskBadge = (grade?: string) => {
        if (!grade) return null
        const cl = grade === '상' ? 'badge-red' : grade === '중' ? 'badge-yellow' : 'badge-green'
        return <span className={`badge ${cl}`}>{grade}</span>
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.3) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '1.25rem 0',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/jsa" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>JSA 작성 이력</h1>
                        <span style={{
                            background: 'rgba(59,130,246,0.2)', color: '#93c5fd',
                            borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
                        }}>총 {filtered.length}건</span>
                    </div>
                    <a
                        href="/api/jsa/export"
                        download
                        className="btn"
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.82rem',
                            background: 'rgba(16,185,129,0.15)',
                            border: '1px solid rgba(16,185,129,0.4)',
                            color: '#a7f3d0',
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        }}
                    >
                        <Download size={15} /> Excel 다운로드
                    </a>
                </div>
            </div>

            <div className="container" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text" className="form-input"
                            placeholder="매장명, 작업명, 작성자 검색..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.25rem' }}
                        />
                    </div>
                    <select className="form-input" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ maxWidth: '140px' }}>
                        <option value="">전체 등급</option>
                        <option value="상">위험 (상)</option>
                        <option value="중">주의 (중)</option>
                        <option value="하">안전 (하)</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filtered.map((rec: any, idx: number) => {
                            const detailId = encodeURIComponent(`${rec.작업명}__${rec.매장명}__${rec.created_at}`)
                            return (
                                <Link key={idx} href={`/jsa/history/${detailId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div
                                        className="card fade-in"
                                        style={{ animationDelay: `${idx * 0.03}s`, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{rec.작업명}</span>
                                                    {riskBadge(rec.위험등급)}
                                                    {rec.유형 && <span className="badge badge-blue">{rec.유형}</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={12} /> {rec.매장명}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={12} /> {rec.작성자}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Calendar size={12} />
                                                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.steps?.length || 1}개 작업단계</span>
                                                    {rec.영업본부 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>· {rec.영업본부}</span>}
                                                    {rec.팀명 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>· {rec.팀명}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                {rec.사진_url && (
                                                    <img src={rec.사진_url} alt="작업사진"
                                                        style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                                                )}
                                                <ChevronRight size={18} color="var(--text-secondary)" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
