'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase, JsaRecord } from '@/lib/supabase'
import { ClipboardList, Plus, History, ArrowLeft, Calendar, User, Building2, BarChart2 } from 'lucide-react'

export default function JsaPage() {
    const [records, setRecords] = useState<JsaRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, thisMonth: 0 })

    useEffect(() => {
        fetchRecentRecords()
    }, [])

    async function fetchRecentRecords() {
        try {
            const { data, error } = await supabase
                .from('jsa_records')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error

            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const thisMonth = (data || []).filter(r =>
                r.created_at && new Date(r.created_at) >= monthStart
            ).length

            setRecords(data || [])
            setStats({ total: data?.length || 0, thisMonth })
        } catch (err) {
            console.error('Error fetching records:', err)
        } finally {
            setLoading(false)
        }
    }

    const riskBadge = (grade?: string) => {
        if (grade === '상') return <span className="badge badge-red">상</span>
        if (grade === '중') return <span className="badge badge-yellow">중</span>
        if (grade === '하') return <span className="badge badge-green">하</span>
        return null
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.3) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '1.5rem 0',
            }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div style={{
                            width: '42px', height: '42px',
                            background: 'var(--gradient-blue)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ClipboardList size={22} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                JSA 위험성평가
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Job Safety Analysis System</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: '전체 평가 건수', value: loading ? '-' : stats.total, icon: <ClipboardList size={18} />, color: '#3b82f6' },
                        { label: '이번 달 작성', value: loading ? '-' : stats.thisMonth, icon: <Calendar size={18} />, color: '#10b981' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: `${stat.color}20`,
                                borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: stat.color,
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                    <Link href="/jsa/new" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', flexDirection: 'column', gap: '0.25rem', height: '80px', fontSize: '0.85rem' }}>
                            <Plus size={20} />
                            신규 작성
                        </button>
                    </Link>
                    <Link href="/jsa/history" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', flexDirection: 'column', gap: '0.25rem', height: '80px', fontSize: '0.85rem' }}>
                            <History size={20} />
                            작성 이력
                        </button>
                    </Link>
                    <Link href="/jsa/dashboard" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{
                            width: '100%', justifyContent: 'center', padding: '1rem',
                            flexDirection: 'column', gap: '0.25rem', height: '80px', fontSize: '0.85rem',
                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd',
                        }}>
                            <BarChart2 size={20} />
                            현황 대시보드
                        </button>
                    </Link>
                </div>

                {/* Recent Records */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                        <History size={18} />
                        최근 작성 이력
                    </h2>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <div className="spinner" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>아직 작성된 위험성평가가 없습니다.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>첫 번째 JSA를 작성해 보세요!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {records.map(record => (
                                <div key={record.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600 }}>{record.작업명}</span>
                                            {riskBadge(record.위험등급)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Building2 size={12} /> {record.매장명}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <User size={12} /> {record.작성자}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Calendar size={12} /> {record.created_at ? new Date(record.created_at).toLocaleDateString('ko-KR') : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
