'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Printer, Trash2, Building2, User, Calendar,
    AlertTriangle, CheckCircle2, ClipboardList, Loader2
} from 'lucide-react'

interface JsaRecord {
    id: number
    영업본부?: string
    부서명?: string
    팀명?: string
    매장명: string
    작업명: string
    단계번호: number
    작성자: string
    관리감독자?: string
    참여근로자?: string
    작업일시?: string
    작업내용?: string
    사진_url?: string
    유해위험요인?: string
    위험등급?: string
    유형?: string
    개선대책?: string
    ai_분석결과?: string
    created_at?: string
}

export default function JsaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [records, setRecords] = useState<JsaRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        fetchGroup()
    }, [id])

    async function fetchGroup() {
        try {
            const res = await fetch('/api/jsa/records')
            const data = await res.json()
            const all: JsaRecord[] = data.data || []
            // id는 "작업명__매장명__created_at" 형태
            const [작업명, 매장명, created_at] = decodeURIComponent(id).split('__')
            const group = all.filter(r =>
                r.작업명 === 작업명 &&
                r.매장명 === 매장명 &&
                r.created_at?.startsWith(created_at?.slice(0, 16) ?? '')
            ).sort((a, b) => a.단계번호 - b.단계번호)
            setRecords(group)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!records.length) return
        setDeleting(true)
        try {
            const r = records[0]
            const params = new URLSearchParams({
                작업명: r.작업명,
                매장명: r.매장명,
                created_at: r.created_at || '',
            })
            const res = await fetch(`/api/jsa/records?${params}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('삭제 실패')
            router.push('/jsa/history')
        } catch (err) {
            alert('삭제 중 오류가 발생했습니다.')
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const riskColor = (grade?: string) => {
        if (grade === '상') return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', text: '#fca5a5', badge: 'badge-red' }
        if (grade === '중') return { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#fde68a', badge: 'badge-yellow' }
        if (grade === '하') return { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#a7f3d0', badge: 'badge-green' }
        return { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', text: 'var(--text-secondary)', badge: '' }
    }

    const first = records[0]
    const maxGrade = records.some(r => r.위험등급 === '상') ? '상'
        : records.some(r => r.위험등급 === '중') ? '중'
            : records.some(r => r.위험등급 === '하') ? '하' : undefined
    const colors = riskColor(maxGrade)

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
        </div>
    )

    if (!records.length) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <AlertTriangle size={48} color="#fca5a5" />
            <p style={{ color: 'var(--text-secondary)' }}>해당 JSA 기록을 찾을 수 없습니다.</p>
            <Link href="/jsa/history" className="btn btn-secondary">목록으로</Link>
        </div>
    )

    return (
        <>
            {/* 인쇄용 스타일 */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-container { padding: 0 !important; }
                    .print-card {
                        border: 1px solid #ccc !important;
                        background: white !important;
                        break-inside: avoid;
                        margin-bottom: 12px !important;
                        page-break-inside: avoid;
                    }
                    .print-header {
                        background: #1e40af !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    * { color: black !important; }
                    .print-title-text { color: white !important; }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
                {/* Header */}
                <div className="no-print" style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.3) 100%)',
                    borderBottom: '1px solid var(--border)',
                    padding: '1.25rem 0',
                    position: 'sticky', top: 0, zIndex: 100,
                }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link href="/jsa/history" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>JSA 상세 조회</h1>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                onClick={() => window.print()}
                            >
                                <Printer size={15} /> 인쇄/PDF
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 size={15} /> 삭제
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container print-container" style={{ padding: '2rem 1.5rem', maxWidth: '860px' }}>

                    {/* 인쇄용 타이틀 */}
                    <div className="print-header" style={{ display: 'none', background: '#1e40af', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                        <h1 className="print-title-text" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
                            JSA 위험성평가서
                        </h1>
                    </div>

                    {/* 기본 정보 카드 */}
                    <div className="card print-card" style={{ marginBottom: '1.5rem', border: `1px solid ${colors.border}`, background: colors.bg }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <ClipboardList size={20} color={colors.text} />
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{first.작업명}</h2>
                                    {maxGrade && (
                                        <span className={`badge ${colors.badge}`}>최고위험 {maxGrade}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                            {[
                                { icon: <Building2 size={14} />, label: '매장명', value: first.매장명 },
                                { icon: <User size={14} />, label: '작성자', value: first.작성자 },
                                { icon: <User size={14} />, label: '관리감독자', value: first.관리감독자 },
                                { icon: <User size={14} />, label: '참여근로자', value: first.참여근로자 },
                                { icon: <Calendar size={14} />, label: '작업일시', value: first.작업일시 ? new Date(first.작업일시).toLocaleString('ko-KR') : '-' },
                                { icon: <Calendar size={14} />, label: '작성일', value: first.created_at ? new Date(first.created_at).toLocaleString('ko-KR') : '-' },
                            ].filter(i => i.value).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(first.영업본부 || first.부서명 || first.팀명) && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                {first.영업본부 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)' }}>{first.영업본부}</span>}
                                {first.부서명 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)' }}>{first.부서명}</span>}
                                {first.팀명 && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)' }}>{first.팀명}</span>}
                            </div>
                        )}
                    </div>

                    {/* 단계별 상세 */}
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📋 단계별 위험성 평가 ({records.length}단계)
                    </h2>

                    {records.map((step, idx) => {
                        const sc = riskColor(step.위험등급)
                        return (
                            <div key={step.id} className="print-card" style={{
                                background: sc.bg,
                                border: `1px solid ${sc.border}`,
                                borderRadius: '14px',
                                padding: '1.25rem',
                                marginBottom: '1rem',
                                animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: sc.bg, border: `2px solid ${sc.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontWeight: 800, color: sc.text,
                                        }}>
                                            {step.단계번호}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>단계 {step.단계번호}</span>
                                    </div>
                                    {step.위험등급 && (
                                        <span className={`badge ${sc.badge}`}>위험등급: {step.위험등급}</span>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                    {step.작업내용 && (
                                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>세부 작업내용</p>
                                            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{step.작업내용}</p>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {step.유해위험요인 && (
                                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                                                <p style={{ fontSize: '0.7rem', color: '#fca5a5', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>⚠ 유해위험요인</p>
                                                <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{step.유해위험요인}</p>
                                            </div>
                                        )}
                                        {step.개선대책 && (
                                            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                                                <p style={{ fontSize: '0.7rem', color: '#a7f3d0', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>✅ 개선대책/안전조치</p>
                                                <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{step.개선대책}</p>
                                            </div>
                                        )}
                                    </div>

                                    {step.유형 && (
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>유형: </span>
                                            <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{step.유형}</span>
                                        </div>
                                    )}

                                    {step.ai_분석결과 && (
                                        <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                                            <p style={{ fontSize: '0.7rem', color: '#c4b5fd', marginBottom: '0.25rem', fontWeight: 600 }}>🤖 AI 분석 결과</p>
                                            <p style={{ fontSize: '0.85rem', color: '#c4b5fd', lineHeight: 1.5 }}>{step.ai_분석결과}</p>
                                        </div>
                                    )}

                                    {step.사진_url && (
                                        <div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>작업 사진</p>
                                            <img
                                                src={step.사진_url}
                                                alt={`단계 ${step.단계번호} 작업사진`}
                                                style={{ maxWidth: '300px', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* 하단 서명란 (인쇄 시 활용) */}
                    <div className="print-card" style={{ marginTop: '2rem', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontWeight: 600 }}>확인 서명</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            {['작성자', '관리감독자', '팀장/점장'].map(role => (
                                <div key={role} style={{ textAlign: 'center' }}>
                                    <div style={{ height: '48px', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 삭제 확인 모달 */}
                {showDeleteConfirm && (
                    <div className="no-print" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                        padding: '1.5rem',
                    }}>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
                            <AlertTriangle size={40} color="#fca5a5" style={{ margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>JSA 기록을 삭제하시겠습니까?</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{first.작업명} — {first.매장명}</strong><br />
                                {records.length}개 단계 전체가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="btn"
                                    style={{ flex: 1, justifyContent: 'center', background: 'var(--gradient-red)', color: 'white' }}
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                                    {deleting ? '삭제 중...' : '삭제'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
