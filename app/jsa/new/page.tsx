'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Upload, X, Loader2,
    Sparkles, AlertTriangle, CheckCircle2, Plus, Trash2, Save
} from 'lucide-react'

// ─── 마스터 작업 데이터 ───────────────────────────────────────────────
const MASTER_WORKS: Record<string, { 세부작업단계: string; 유해위험요인: string; 안전조치사항: string }[]> = {
    '점등/소등 작업': [
        { 세부작업단계: '작업 전 전원계통 상태 확인(차단기/표시등)', 유해위험요인: '누전 상태 미확인으로 감전', 안전조치사항: '표시등/차단기 이상 여부 확인, 이상 시 즉시 중단 및 담당자 연락' },
        { 세부작업단계: '분전함 위치로 이동 및 주변 정리', 유해위험요인: '통로 적치물로 걸림/넘어짐', 안전조치사항: '통로 주변 정리 및 이동 동선 확보' },
    ],
    '진열 작업': [
        { 세부작업단계: '작업 전 진열 위치 및 주변 환경 확인', 유해위험요인: '통로 적치물로 걸림/넘어짐', 안전조치사항: '통로 주변 정리 및 이동 동선 확보' },
        { 세부작업단계: '작업 전 보호구 착용(안전화/장갑 등)', 유해위험요인: '부적절한 복장(슬리퍼 등) 착용으로 부상', 안전조치사항: '작업에 적합한 복장 및 안전 보호구 착용' },
    ],
    '합포 작업': [
        { 세부작업단계: '포장 설비(결속기 등) 점검 및 주변 정리', 유해위험요인: '설비 오작동 및 주변 정리 미흡으로 부상', 안전조치사항: '설비 점검 및 작업장 주변 정리' },
        { 세부작업단계: '중량물 운반 시 올바른 자세 유지', 유해위험요인: '무거운 물건을 무리한 자세로 들다가 허리 부상', 안전조치사항: '무릎을 굽히고 물건을 몸에 밀착하여 운반' },
    ],
    '상품 입고 작업': [
        { 세부작업단계: '검수 전 하차 구간 주변 환경 확인', 유해위험요인: '차량 이동 및 동선 미확보로 인한 사고', 안전조치사항: '차량 유도 및 동선 확보, 안전모 착용' },
        { 세부작업단계: '상품 하차 및 검수 작업', 유해위험요인: '상품 낙하 및 무리한 운반으로 인한 부상', 안전조치사항: '상품 낙하 주의 및 운반 보조 도구(대차) 활용' },
    ],
    '계산대 업무': [
        { 세부작업단계: '계산대 주변 정리 및 바닥 상태 확인', 유해위험요인: '바닥 물기나 이물질로 인한 미끄러짐', 안전조치사항: '계산대 주변 상시 정리 및 물기 제거' },
        { 세부작업단계: '장시간 서서 하는 작업에 따른 스트레칭', 유해위험요인: '부적절한 자세로 인한 근골격계 질환', 안전조치사항: '틈틈이 스트레칭 실시 및 발 받침대 활용' },
    ],
    '분류 작업': [
        { 세부작업단계: '분류 작업장 바닥 상태 및 조명 확인', 유해위험요인: '어두운 조명 및 바닥 미끄럼으로 인한 사고', 안전조치사항: '조명 상태 확인 및 바닥 수시 청소' },
        { 세부작업단계: '컨베이어 등 설비 점검 및 가동', 유해위험요인: '설비 말림 및 끼임 사고', 안전조치사항: '회전부 덮개 확인 및 비상정지 버튼 위치 숙지' },
    ],
    '청소 작업': [
        { 세부작업단계: '청소 도구 점검 및 바닥 상태 확인', 유해위험요인: '파손된 도구 사용 및 미끄러짐으로 인한 사고', 안전조치사항: '도구 점검 및 미끄럼 주의 표지판 설치' },
        { 세부작업단계: '세제 등 화학물질 취급 시 보호구 착용', 유해위험요인: '세제 접촉 및 흡입으로 인한 건강 장애', 안전조치사항: '보호 장갑 및 마스크 착용, 환기 실시' },
    ],
    '은행 업무 작업': [
        { 세부작업단계: '이동 전 현금 보관상태 및 가방 확인', 유해위험요인: '현금 노출 및 가방 파손으로 인한 도난 사고', 안전조치사항: '현금 비노출 보관 및 2인 1조 이동 권고' },
        { 세부작업단계: '은행 이동 시 교통 법규 준수', 유해위험요인: '보행 중 스마트폰 사용 등으로 인한 교통 사고', 안전조치사항: '횡단보도 이용 및 주변 살피며 이동' },
    ],
    '파지 폐기 작업': [
        { 세부작업단계: '파지 압축기 가동 전 내부 확인', 유해위험요인: '내부 이물질 및 사람 유무 미확인 사고', 안전조치사항: '압축기 가동 전 반드시 내부 육안 확인' },
        { 세부작업단계: '파지 운반 및 적재', 유해위험요인: '파지 더미 낙하 및 무리한 무게 운반', 안전조치사항: '적재 높이 제한 준수 및 무게 분산 운반' },
    ],
    '주차장 관리 작업': [
        { 세부작업단계: '차량 유도 전 경광봉 및 보호구 확인', 유해위험요인: '야간 시인성 미확보로 인한 충돌 사고', 안전조치사항: '경광봉 작동 확인 및 형광 조끼 착용' },
        { 세부작업단계: '차량 유도 및 주차장 순찰', 유해위험요인: '차량 이동 경로 확인 미흡으로 인한 사고', 안전조치사항: '차량 이동 경로에서 벗어나 안전하게 유도' },
    ],
    '건물 외부 청소': [
        { 세부작업단계: '외부 기상 상태 및 주변 보행자 확인', 유해위험요인: '강풍/폭우 시 작업 강행으로 인한 사고', 안전조치사항: '기상 악화 시 작업 중단 및 보행자 통행 유도' },
        { 세부작업단계: '높은 곳 청소 시 사다리 등 점검', 유해위험요인: '사다리 전도 및 추락 사고', 안전조치사항: '2인 1조 작업 및 사다리 벌어짐 방지 조치' },
    ],
    '매대 리뉴얼': [
        { 세부작업단계: '매대 하중 계산 및 수평 상태 확인', 유해위험요인: '무리한 적재로 인한 매대 붕괴', 안전조치사항: '하중 분산 적재 및 매대 고정 상태 확인' },
        { 세부작업단계: '집기 이동 및 설치 시 손 끼임 주의', 유해위험요인: '집기 낙하 및 끼임 사고', 안전조치사항: '안전 장갑 착용 및 보조자 협력 작업' },
    ],
    '에어컨 필터 청소': [
        { 세부작업단계: '사다리 설치 전 바닥 상태 및 주변 확인', 유해위험요인: '사다리 미끄러짐 및 전도 사고', 안전조치사항: '평탄한 바닥 설치 및 아웃트리거 확인' },
        { 세부작업단계: '필터 탈거 및 세척', 유해위험요인: '높은 곳 작업 시 추락 및 먼지 흡입', 안전조치사항: '안전모 착용, 2인 1조(사다리 지지), 마스크 착용' },
    ],
    '하부장 청소 작업': [
        { 세부작업단계: '하부장 내부 수납물 정리', 유해위험요인: '날카로운 물체에 의한 베임 사고', 안전조치사항: '장갑 착용 및 내부 육안 확인 후 작업' },
        { 세부작업단계: '좁은 공간 청소 시 올바른 자세 유지', 유해위험요인: '좁은 곳에서 무리한 자세로 인한 부상', 안전조치사항: '허리 과도하게 굽히지 않도록 주의' },
    ],
}

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
    const [선택작업명, set선택작업명] = useState('')
    const [작업명, set작업명] = useState('')

    // 작업일시: KST 현재 시각으로 초기화
    const [작업일시, set작업일시] = useState(() => {
        const now = new Date()
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
        return kst.toISOString().slice(0, 16)
    })

    // Work steps
    const [steps, setSteps] = useState<WorkStep[]>([
        { 단계번호: 1, 작업내용: '', 분석중: false }
    ])

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        fetchOrganizations()
    }, [])

    function handleMasterWorkSelect(workName: string) {
        set선택작업명(workName)
        set작업명(workName)
        if (!workName || !MASTER_WORKS[workName]) return
        const masterSteps = MASTER_WORKS[workName]
        setSteps(masterSteps.map((s, i) => ({
            단계번호: i + 1,
            작업내용: s.세부작업단계,
            분석중: false,
            분석결과: {
                유해위험요인: s.유해위험요인,
                개선대책: s.안전조치사항,
            },
        })))
    }

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

    // 중복 저장 완전 방지용 ref
    const submittedRef = useRef(false)

    const handleSave = useCallback(async () => {
        // 이미 저장 중이거나 이미 제출된 경우 즉시 차단
        if (submittedRef.current || saving) return

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

        // 즉시 플래그 설정 (비동기 전에)
        submittedRef.current = true
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
            submittedRef.current = false  // 실패 시 재시도 허용
            setSaveError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
        } finally {
            setSaving(false)
        }
    }, [saving, 선택매장, 직접입력매장, 작성자, 직접입력작성자, 작업명, steps, 선택본부, 선택부서, 선택팀, 관리감독자, 참여근로자, 작업일시])

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

                        {/* 작업명: 마스터 선택 드롭다운 */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">작업명 * (마스터 작업 선택)</label>
                            <select
                                className="form-input"
                                value={선택작업명}
                                onChange={e => handleMasterWorkSelect(e.target.value)}
                            >
                                <option value="">-- 마스터 작업 선택 --</option>
                                {Object.keys(MASTER_WORKS).map(w => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                                <option value="__직접입력__">직접 입력</option>
                            </select>
                            {(선택작업명 === '__직접입력__' || (!선택작업명 && 작업명)) && (
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ marginTop: '0.5rem' }}
                                    placeholder="작업명 직접 입력 (예: 점등/소등 작업)"
                                    value={작업명}
                                    onChange={e => set작업명(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
