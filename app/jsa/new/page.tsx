'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, ChevronDown, Upload, X, Loader2,
    Sparkles, AlertTriangle, CheckCircle2, Plus, Trash2, Save
} from 'lucide-react'

interface OrgHierarchy {
    [본부: string]: {
        [부서: string]: {
            [팀: string]: string[]
        }
    }
}

interface WorkStep {
    단계번호: number
    작업내용: string
    이미지파일?: File
    이미지미리보기?: string
    이미지URL?: string
    분석중: boolean
    분석결과?: {
        위험등급?: string
        위험점수?: number
        유해위험요인?: string
        유형?: string
        개선대책?: string
        ai_분석결과?: string
    }
}

const WORKERS = [
    'Kang (안전)', 'Park (보건)', 'Yoo (안전)', 'Seo (안전)',
    'Lee (보건)', 'Kim (안전)', 'Jung (안전)', 'Choi (보건)', '직접 입력'
]

export default function JsaNewPage() {
    const router = useRouter()
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Org state
    const [hierarchy, setHierarchy] = useState<OrgHierarchy>({})
    const [orgLoading, setOrgLoading] = useState(true)
    const [선택본부, set선택본부] = useState('')
    const [선택부서, set선택부서] = useState('')
    const [선택팀, set선택팀] = useState('')
    const [선택매장, set선택매장] = useState('')
    const [직접입력매장, set직접입력매장] = useState('')

    // Form state
    const [작성자, set작성자] = useState('')
    const [직접입력작성자, set직접입력작성자] = useState('')
    const [관리감독자, set관리감독자] = useState('')
    const [참여근로자, set참여근로자] = useState('')
    const [작업명, set작업명] = useState('')
    const [작업일시, set작업일시] = useState(new Date().toISOString().slice(0, 16))

    // Work steps
    const [steps, setSteps] = useState<WorkStep[]>([
        { 단계번호: 1, 작업내용: '', 분석중: false }
    ])

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        fetchOrganizations()
    }, [])

    async function fetchOrganizations() {
        try {
            const res = await fetch('/api/organizations')
            const data = await res.json()
            if (data.hierarchy) {
                setHierarchy(data.hierarchy)
            }
        } catch (err) {
            console.error('Org fetch error:', err)
        } finally {
            setOrgLoading(false)
        }
    }

    function addStep() {
        setSteps(prev => [...prev, {
            단계번호: prev.length + 1,
            작업내용: '',
            분석중: false,
        }])
    }

    function removeStep(idx: number) {
        setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, 단계번호: i + 1 })))
    }

    function updateStep(idx: number, updates: Partial<WorkStep>) {
        setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s))
    }

    async function handleImageUpload(idx: number, file: File) {
        const previewUrl = URL.createObjectURL(file)
        updateStep(idx, { 이미지파일: file, 이미지미리보기: previewUrl, 분석중: true })

        try {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('작업명', 작업명)
            formData.append('작업내용', steps[idx].작업내용)
            formData.append('매장명', 선택매장 || 직접입력매장)

            const res = await fetch('/api/jsa/analyze', { method: 'POST', body: formData })
            const data = await res.json()

            if (data.analysis) {
                updateStep(idx, {
                    분석중: false,
                    이미지URL: data.imageUrl,
                    분석결과: data.analysis,
                })
            }
        } catch (err) {
            console.error('Analysis error:', err)
            updateStep(idx, { 분석중: false })
        }
    }

    async function analyzeWithoutImage(idx: number) {
        if (!steps[idx].작업내용) return
        updateStep(idx, { 분석중: true })

        try {
            const formData = new FormData()
            formData.append('작업명', 작업명)
            formData.append('작업내용', steps[idx].작업내용)
            formData.append('매장명', 선택매장 || 직접입력매장)

            const res = await fetch('/api/jsa/analyze', { method: 'POST', body: formData })
            const data = await res.json()

            if (data.analysis) {
                updateStep(idx, { 분석중: false, 분석결과: data.analysis })
            }
        } catch (err) {
            updateStep(idx, { 분석중: false })
        }
    }

    async function handleSave() {
        const 매장 = 선택매장 || 직접입력매장
        const 작성자명 = 작성자 === '직접 입력' ? 직접입력작성자 : 작성자

        if (!매장 || !작성자명 || !작업명) {
            setSaveError('매장명, 작성자, 작업명은 필수 입력 항목입니다.')
            return
        }
        if (steps.some(s => !s.작업내용)) {
            setSaveError('모든 작업 단계의 작업내용을 입력해주세요.')
            return
        }

        setSaving(true)
        setSaveError('')

        try {
            for (const step of steps) {
                const payload = {
                    영업본부: 선택본부 || null,
                    부서명: 선택부서 || null,
                    팀명: 선택팀 || null,
                    매장명: 매장,
                    작업명,
                    단계번호: step.단계번호,
                    작성자: 작성자명,
                    관리감독자: 관리감독자 || null,
                    참여근로자: 참여근로자 || null,
                    작업일시,
                    작업내용: step.작업내용,
                    사진_url: step.이미지URL || null,
                    유해위험요인: step.분석결과?.유해위험요인 || null,
                    위험등급: step.분석결과?.위험등급 || null,
                    유형: step.분석결과?.유형 || null,
                    개선대책: step.분석결과?.개선대책 || null,
                    ai_분석결과: step.분석결과?.ai_분석결과 || null,
                }

                const res = await fetch('/api/jsa/records', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                if (!res.ok) throw new Error('Save failed')
            }

            router.push('/jsa/history')
        } catch (err) {
            setSaveError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }

    const riskColor = (grade?: string) => {
        if (grade === '상') return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' }
        if (grade === '중') return { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fde68a' }
        if (grade === '하') return { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#a7f3d0' }
        return { bg: 'rgba(255,255,255,0.05)', border: 'var(--border)', text: 'var(--text-secondary)' }
    }

    const 본부목록 = Object.keys(hierarchy)
    const 부서목록 = 선택본부 ? Object.keys(hierarchy[선택본부] || {}) : []
    const 팀목록 = 선택본부 && 선택부서 ? Object.keys(hierarchy[선택본부]?.[선택부서] || {}) : []
    const 매장목록 = 선택본부 && 선택부서 && 선택팀
        ? (hierarchy[선택본부]?.[선택부서]?.[선택팀] || [])
        : []

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, rgba(30,64,175,0.3) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '1.25rem 0',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/jsa" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>신규 JSA 위험성평가 작성</h1>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ padding: '0.6rem 1.25rem' }}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
                {/* Error */}
                {saveError && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                        color: '#fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <AlertTriangle size={16} /> {saveError}
                    </div>
                )}

                {/* Section 1: Organization */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
                        📍 조직 선택
                    </h2>
                    {orgLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* 본부 */}
                            <div className="form-group">
                                <label className="form-label">영업본부</label>
                                <select
                                    className="form-input"
                                    value={선택본부}
                                    onChange={e => { set선택본부(e.target.value); set선택부서(''); set선택팀(''); set선택매장('') }}
                                >
                                    <option value="">-- 선택 --</option>
                                    {본부목록.map(b => <option key={b} value={b}>{b}</option>)}
                                    <option value="직접입력">직접 입력</option>
                                </select>
                            </div>

                            {/* 부서 */}
                            <div className="form-group">
                                <label className="form-label">부서명</label>
                                <select
                                    className="form-input"
                                    value={선택부서}
                                    onChange={e => { set선택부서(e.target.value); set선택팀(''); set선택매장('') }}
                                    disabled={!선택본부}
                                >
                                    <option value="">-- 선택 --</option>
                                    {부서목록.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* 팀 */}
                            <div className="form-group">
                                <label className="form-label">팀명</label>
                                <select
                                    className="form-input"
                                    value={선택팀}
                                    onChange={e => { set선택팀(e.target.value); set선택매장('') }}
                                    disabled={!선택부서}
                                >
                                    <option value="">-- 선택 --</option>
                                    {팀목록.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* 매장 */}
                            <div className="form-group">
                                <label className="form-label">매장명 *</label>
                                {매장목록.length > 0 ? (
                                    <select
                                        className="form-input"
                                        value={선택매장}
                                        onChange={e => set선택매장(e.target.value)}
                                        disabled={!선택팀}
                                    >
                                        <option value="">-- 선택 --</option>
                                        {매장목록.map(m => <option key={m} value={m}>{m}</option>)}
                                        <option value="직접입력">직접 입력</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="매장명 입력"
                                        value={직접입력매장}
                                        onChange={e => set직접입력매장(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2: Basic Info */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
                        👤 기본 정보
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">작성자 *</label>
                            <select className="form-input" value={작성자} onChange={e => set작성자(e.target.value)}>
                                <option value="">-- 선택 --</option>
                                {WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>

                        {작성자 === '직접 입력' && (
                            <div className="form-group">
                                <label className="form-label">직접 입력</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="성함 입력"
                                    value={직접입력작성자}
                                    onChange={e => set직접입력작성자(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">관리감독자</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="관리감독자 성함"
                                value={관리감독자}
                                onChange={e => set관리감독자(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">참여 근로자</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="참여 근로자 정보"
                                value={참여근로자}
                                onChange={e => set참여근로자(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">작업명 *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="예: 점등/소등 작업"
                                value={작업명}
                                onChange={e => set작업명(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">작업 일시</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={작업일시}
                                onChange={e => set작업일시(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Work Steps */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 className="section-title">
                            📋 작업 단계별 위험성평가
                        </h2>
                        <button className="btn btn-secondary" onClick={addStep} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            <Plus size={14} /> 단계 추가
                        </button>
                    </div>

                    {steps.map((step, idx) => {
                        const colors = riskColor(step.분석결과?.위험등급)
                        return (
                            <div key={idx} style={{
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '14px',
                                padding: '1.25rem',
                                marginBottom: '1rem',
                                transition: 'all 0.3s ease',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 700, color: colors.text, fontSize: '0.9rem' }}>
                                        단계 {step.단계번호}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {step.분석결과?.위험등급 && (
                                            <span className={`badge badge-${step.분석결과.위험등급 === '상' ? 'red' : step.분석결과.위험등급 === '중' ? 'yellow' : 'green'}`}>
                                                위험등급: {step.분석결과.위험등급}
                                            </span>
                                        )}
                                        {steps.length > 1 && (
                                            <button onClick={() => removeStep(idx)} style={{
                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-secondary)', padding: '0.25rem',
                                            }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Work content */}
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">작업내용 (단계)</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="이 단계에서 수행하는 작업 내용을 입력하세요"
                                        value={step.작업내용}
                                        onChange={e => updateStep(idx, { 작업내용: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: step.분석결과 ? '1rem' : '0' }}>
                                    {step.이미지미리보기 ? (
                                        <div style={{ position: 'relative', width: '120px', height: '90px', flexShrink: 0 }}>
                                            <img
                                                src={step.이미지미리보기}
                                                alt="작업사진"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            />
                                            <button
                                                onClick={() => updateStep(idx, { 이미지파일: undefined, 이미지미리보기: undefined, 이미지URL: undefined })}
                                                style={{
                                                    position: 'absolute', top: '-6px', right: '-6px',
                                                    background: 'var(--danger)', color: 'white', border: 'none',
                                                    borderRadius: '50%', width: '20px', height: '20px',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : null}

                                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                        >
                                            <Upload size={14} /> 사진 업로드
                                        </button>
                                        <input
                                            ref={el => { fileInputRefs.current[idx] = el }}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(idx, file)
                                            }}
                                        />
                                        <button
                                            className="btn"
                                            style={{
                                                padding: '0.5rem 1rem', fontSize: '0.8rem',
                                                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                                                color: 'white',
                                            }}
                                            onClick={() => analyzeWithoutImage(idx)}
                                            disabled={step.분석중 || !step.작업내용}
                                        >
                                            {step.분석중 ? (
                                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <Sparkles size={14} />
                                            )}
                                            {step.분석중 ? 'AI 분석 중...' : 'AI 위험도 분석'}
                                        </button>
                                    </div>
                                </div>

                                {/* Analysis Result */}
                                {step.분석결과 && (
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '10px',
                                        padding: '1rem',
                                        marginTop: '0.5rem',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <Sparkles size={14} color="#a78bfa" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>AI 분석 결과</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                            {step.분석결과.유해위험요인 && (
                                                <div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>유해위험요인: </span>
                                                    <span style={{ color: colors.text }}>{step.분석결과.유해위험요인}</span>
                                                </div>
                                            )}
                                            {step.분석결과.유형 && (
                                                <div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>유형: </span>
                                                    <span>{step.분석결과.유형}</span>
                                                </div>
                                            )}
                                        </div>
                                        {step.분석결과.개선대책 && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>개선대책: </span>
                                                <span style={{ color: '#a7f3d0' }}>{step.분석결과.개선대책}</span>
                                            </div>
                                        )}
                                        {step.분석결과.ai_분석결과 && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.5rem',
                                                background: 'rgba(167,139,250,0.1)',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                color: '#c4b5fd',
                                                lineHeight: 1.5,
                                            }}>
                                                {step.분석결과.ai_분석결과}
                                            </div>
                                        )}

                                        {/* Manual override inputs */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: '0.7rem' }}>위험등급</label>
                                                <select
                                                    className="form-input"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                    value={step.분석결과?.위험등급 || ''}
                                                    onChange={e => updateStep(idx, { 분석결과: { ...step.분석결과, 위험등급: e.target.value } })}
                                                >
                                                    <option value="">선택</option>
                                                    <option value="상">상</option>
                                                    <option value="중">중</option>
                                                    <option value="하">하</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontSize: '0.7rem' }}>유형 수정</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                                    value={step.분석결과?.유형 || ''}
                                                    onChange={e => updateStep(idx, { 분석결과: { ...step.분석결과, 유형: e.target.value } })}
                                                />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label" style={{ fontSize: '0.7rem' }}>개선대책 수정</label>
                                                <textarea
                                                    className="form-input"
                                                    style={{ fontSize: '0.8rem', padding: '0.5rem', minHeight: '60px' }}
                                                    value={step.분석결과?.개선대책 || ''}
                                                    onChange={e => updateStep(idx, { 분석결과: { ...step.분석결과, 개선대책: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                        onClick={addStep}
                    >
                        <Plus size={16} /> 작업 단계 추가
                    </button>
                </div>

                {/* Save Button */}
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <Loader2 size={20} /> : <CheckCircle2 size={20} />}
                    {saving ? '저장 중...' : '위험성평가 저장 완료'}
                </button>
            </div>

            <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    )
}
