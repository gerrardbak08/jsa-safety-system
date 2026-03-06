'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Upload, X, Loader2,
    Sparkles, AlertTriangle, CheckCircle2, Plus, Trash2, Save
} from 'lucide-react'

// ─── 마스터 작업 데이터 (최소 3단계 보장) ───────────────────────────────────────────────
const MASTER_WORKS: Record<string, { 세부작업단계: string; 유해위험요인: string; 안전조치사항: string }[]> = {
    '점등/소등 작업': [
        { 세부작업단계: '작업 전 전원계통 상태 확인(차단기/표시등)', 유해위험요인: '누전 상태 미확인으로 감전', 안전조치사항: '표시등/차단기 이상 여부 확인, 이상 시 즉시 중단 및 담당자 연락' },
        { 세부작업단계: '분전함 위치로 이동 및 주변 정리', 유해위험요인: '통로 적치물로 걸림/넘어짐', 안전조치사항: '통로 주변 정리 및 이동 동선 확보' },
        { 세부작업단계: '점등/소등 후 이상 유무 최종 확인', 유해위험요인: '설비 이상으로 화재 발생 위험', 안전조치사항: '점등 후 전원 이상 여부 육안 확인 및 이상 시 즉시 담당자 연락' },
    ],
    '진열 작업': [
        { 세부작업단계: '작업 전 진열 위치 및 주변 환경 확인', 유해위험요인: '통로 적치물로 걸림/넘어짐', 안전조치사항: '통로 주변 정리 및 이동 동선 확보' },
        { 세부작업단계: '작업 전 보호구 착용(안전화/장갑 등)', 유해위험요인: '부적절한 복장(슬리퍼 등) 착용으로 부상', 안전조치사항: '작업에 적합한 복장 및 안전 보호구 착용' },
        { 세부작업단계: '사다리/발판 사용 시 전도 방지 조치', 유해위험요인: '높은 선반 작업 중 추락 및 낙하물 사고', 안전조치사항: '2인 1조 작업 및 사다리 고정 상태 확인' },
    ],
    '합포 작업': [
        { 세부작업단계: '포장 설비(결속기 등) 점검 및 주변 정리', 유해위험요인: '설비 오작동 및 주변 정리 미흡으로 부상', 안전조치사항: '설비 점검 및 작업장 주변 정리' },
        { 세부작업단계: '중량물 운반 시 올바른 자세 유지', 유해위험요인: '무거운 물건을 무리한 자세로 들다가 허리 부상', 안전조치사항: '무릎을 굽히고 물건을 몸에 밀착하여 운반' },
        { 세부작업단계: '포장 완료 후 설비 전원 차단 및 정리', 유해위험요인: '설비 오작동으로 인한 끼임 사고', 안전조치사항: '작업 완료 후 반드시 전원 차단 및 설비 잠금 조치' },
    ],
    '상품 입고 작업': [
        { 세부작업단계: '검수 전 하차 구간 주변 환경 확인', 유해위험요인: '차량 이동 및 동선 미확보로 인한 사고', 안전조치사항: '차량 유도 및 동선 확보, 안전모 착용' },
        { 세부작업단계: '상품 하차 및 검수 작업', 유해위험요인: '상품 낙하 및 무리한 운반으로 인한 부상', 안전조치사항: '상품 낙하 주의 및 운반 보조 도구(대차) 활용' },
        { 세부작업단계: '입고 상품 보관 및 적재', 유해위험요인: '과적으로 인한 선반 붕괴 및 낙하 사고', 안전조치사항: '적재 높이/하중 제한 준수 및 균형 있게 적재' },
    ],
    '계산대 업무': [
        { 세부작업단계: '계산대 주변 정리 및 바닥 상태 확인', 유해위험요인: '바닥 물기나 이물질로 인한 미끄러짐', 안전조치사항: '계산대 주변 상시 정리 및 물기 제거' },
        { 세부작업단계: '장시간 서서 하는 작업에 따른 스트레칭', 유해위험요인: '부적절한 자세로 인한 근골격계 질환', 안전조치사항: '틈틈이 스트레칭 실시 및 발 받침대 활용' },
        { 세부작업단계: '현금 취급 및 고객 응대 시 안전 확인', 유해위험요인: '도난 및 분쟁으로 인한 안전 위협', 안전조치사항: '2인 이상 근무 및 비상연락망 확인' },
    ],
    '분류 작업': [
        { 세부작업단계: '분류 작업장 바닥 상태 및 조명 확인', 유해위험요인: '어두운 조명 및 바닥 미끄럼으로 인한 사고', 안전조치사항: '조명 상태 확인 및 바닥 수시 청소' },
        { 세부작업단계: '컨베이어 등 설비 점검 및 가동', 유해위험요인: '설비 말림 및 끼임 사고', 안전조치사항: '회전부 덮개 확인 및 비상정지 버튼 위치 숙지' },
        { 세부작업단계: '중량물 취급 시 보조 장비 활용', 유해위험요인: '무거운 물건의 무리한 운반으로 허리 부상', 안전조치사항: '대차 또는 지게차 등 운반 보조 장비 활용' },
    ],
    '청소 작업': [
        { 세부작업단계: '청소 도구 점검 및 바닥 상태 확인', 유해위험요인: '파손된 도구 사용 및 미끄러짐으로 인한 사고', 안전조치사항: '도구 점검 및 미끄럼 주의 표지판 설치' },
        { 세부작업단계: '세제 등 화학물질 취급 시 보호구 착용', 유해위험요인: '세제 접촉 및 흡입으로 인한 건강 장애', 안전조치사항: '보호 장갑 및 마스크 착용, 환기 실시' },
        { 세부작업단계: '청소 완료 후 도구 정리 및 보관', 유해위험요인: '도구 방치로 인한 통행 중 걸림 사고', 안전조치사항: '사용 후 즉시 지정 장소에 보관 및 정리' },
    ],
    '은행 업무 작업': [
        { 세부작업단계: '이동 전 현금 보관상태 및 가방 확인', 유해위험요인: '현금 노출 및 가방 파손으로 인한 도난 사고', 안전조치사항: '현금 비노출 보관 및 2인 1조 이동 권고' },
        { 세부작업단계: '은행 이동 시 교통 법규 준수', 유해위험요인: '보행 중 스마트폰 사용 등으로 인한 교통 사고', 안전조치사항: '횡단보도 이용 및 주변 살피며 이동' },
        { 세부작업단계: '은행 업무 완료 후 영수증 및 잔액 확인', 유해위험요인: '확인 소홀로 인한 금전 분쟁 및 오류', 안전조치사항: '영수증 수령 및 잔액 확인 후 귀점' },
    ],
    '파지 폐기 작업': [
        { 세부작업단계: '파지 압축기 가동 전 내부 확인', 유해위험요인: '내부 이물질 및 사람 유무 미확인 사고', 안전조치사항: '압축기 가동 전 반드시 내부 육안 확인' },
        { 세부작업단계: '파지 운반 및 적재', 유해위험요인: '파지 더미 낙하 및 무리한 무게 운반', 안전조치사항: '적재 높이 제한 준수 및 무게 분산 운반' },
        { 세부작업단계: '압축 완료 후 설비 전원 차단 및 잠금', 유해위험요인: '미차단 설비로 인한 끼임 사고', 안전조치사항: '작업 완료 후 전원 차단 및 설비 잠금 조치' },
    ],
    '주차장 관리 작업': [
        { 세부작업단계: '차량 유도 전 경광봉 및 보호구 확인', 유해위험요인: '야간 시인성 미확보로 인한 충돌 사고', 안전조치사항: '경광봉 작동 확인 및 형광 조끼 착용' },
        { 세부작업단계: '차량 유도 및 주차장 순찰', 유해위험요인: '차량 이동 경로 확인 미흡으로 인한 사고', 안전조치사항: '차량 이동 경로에서 벗어나 안전하게 유도' },
        { 세부작업단계: '이상 차량 및 위험 요소 발견 시 즉시 보고', 유해위험요인: '방치된 차량 및 위험 시설물로 인한 사고', 안전조치사항: '이상 발견 시 즉시 담당자에게 연락 및 차단 조치' },
    ],
    '건물 외부 청소': [
        { 세부작업단계: '외부 기상 상태 및 주변 보행자 확인', 유해위험요인: '강풍/폭우 시 작업 강행으로 인한 사고', 안전조치사항: '기상 악화 시 작업 중단 및 보행자 통행 유도' },
        { 세부작업단계: '높은 곳 청소 시 사다리 등 점검', 유해위험요인: '사다리 전도 및 추락 사고', 안전조치사항: '2인 1조 작업 및 사다리 벌어짐 방지 조치' },
        { 세부작업단계: '청소 완료 후 장비 회수 및 안전선 제거', 유해위험요인: '안전선 미제거 시 보행자 걸림 사고', 안전조치사항: '작업 완료 후 안전선 및 장비 즉시 회수' },
    ],
    '매대 리뉴얼': [
        { 세부작업단계: '매대 하중 계산 및 수평 상태 확인', 유해위험요인: '무리한 적재로 인한 매대 붕괴', 안전조치사항: '하중 분산 적재 및 매대 고정 상태 확인' },
        { 세부작업단계: '집기 이동 및 설치 시 손 끼임 주의', 유해위험요인: '집기 낙하 및 끼임 사고', 안전조치사항: '안전 장갑 착용 및 보조자 협력 작업' },
        { 세부작업단계: '리뉴얼 완료 후 안전 상태 최종 점검', 유해위험요인: '매대 불안정으로 인한 상품 낙하', 안전조치사항: '매대 수평 및 고정 상태 최종 확인' },
    ],
    '에어컨 필터 청소': [
        { 세부작업단계: '사다리 설치 전 바닥 상태 및 주변 확인', 유해위험요인: '사다리 미끄러짐 및 전도 사고', 안전조치사항: '평탄한 바닥 설치 및 아웃트리거 확인' },
        { 세부작업단계: '필터 탈거 및 세척', 유해위험요인: '높은 곳 작업 시 추락 및 먼지 흡입', 안전조치사항: '안전모 착용, 2인 1조(사다리 지지), 마스크 착용' },
        { 세부작업단계: '필터 재설치 및 에어컨 가동 확인', 유해위험요인: '불완전 설치로 인한 낙하 및 오작동', 안전조치사항: '필터 완전 고정 확인 후 시운전 실시' },
    ],
    '하부장 청소 작업': [
        { 세부작업단계: '하부장 내부 수납물 정리', 유해위험요인: '날카로운 물체에 의한 베임 사고', 안전조치사항: '장갑 착용 및 내부 육안 확인 후 작업' },
        { 세부작업단계: '좁은 공간 청소 시 올바른 자세 유지', 유해위험요인: '좁은 곳에서 무리한 자세로 인한 부상', 안전조치사항: '허리 과도하게 굽히지 않도록 주의' },
        { 세부작업단계: '청소 완료 후 수납물 정리 및 문 잠금', 유해위험요인: '문 개방 상태 방치로 통행 중 충돌 사고', 안전조치사항: '정리 완료 후 문 완전히 닫고 잠금 확인' },
    ],
}

// ─── 매장별 산업재해 이력 (하드코딩 기본값, 실제 데이터는 Supabase에서 fetch) ───
// 형식: { 매장명: { 작업명: string[], 재해유형: string } }
type AccidentRecord = { 작업명: string; 재해유형: string; 발생일: string }

const MOCK_ACCIDENTS: Record<string, AccidentRecord> = {
    '올리브영 명동점': { 작업명: '진열 작업', 재해유형: '넘어짐', 발생일: '2023-11-15' },
    '이마트 성수점': { 작업명: '합포 작업', 재해유형: '베임/찔림', 발생일: '2024-01-10' },
    '스타벅스 강남본점': { 작업명: '청소 작업', 재해유형: '미끄러짐', 발생일: '2023-09-05' },
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
    // 조치 전
    이미지파일?: File
    이미지미리보기?: string
    이미지URL?: string
    조치전위험등급?: string
    유해위험요인?: string
    // 조치 후
    조치후이미지파일?: File
    조치후이미지미리보기?: string
    조치후이미지URL?: string
    조치후위험등급?: string
    개선대책?: string
    예산사용내역?: string
    조치완료일자?: string
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
    const fileInputAfterRefs = useRef<(HTMLInputElement | null)[]>([])

    // Org state
    const [hierarchy, setHierarchy] = useState<OrgHierarchy>({})
    const [orgLoading, setOrgLoading] = useState(true)
    const [선택본부, set선택본부] = useState('')
    const [선택부서, set선택부서] = useState('')
    const [선택팀, set선택팀] = useState('')
    const [선택매장, set선택매장] = useState('')
    const [직접입력매장, set직접입력매장] = useState('')

    // Form state: 작성자 (사번, 이름)
    const [사번, set사번] = useState('')
    const [이름, set이름] = useState('')
    const [관리감독자, set관리감독자] = useState('')
    const [참여근로자, set참여근로자] = useState('')

    // 작업명 멀티셀렉트
    const [선택작업명목록, set선택작업명목록] = useState<string[]>([])

    // 선택된 모든 작업명 문자열 (저장용)
    const 작업명 = 선택작업명목록.join(', ')

    // 작업일시: KST 현재 시각으로 초기화
    const [작업일시, set작업일시] = useState(() => {
        const now = new Date()
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
        return kst.toISOString().slice(0, 16)
    })

    const [재해이력, set재해이력] = useState<AccidentRecord | null>(null)

    // Work steps
    const [steps, setSteps] = useState<WorkStep[]>([
        { 단계번호: 1, 작업내용: '', 분석중: false }
    ])

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        fetchOrganizations()
        fetchWorkers()

        // LocalStorage에서 마지막 선택값 복원
        try {
            const saved = localStorage.getItem('jsa_last_selection')
            if (saved) {
                const s = JSON.parse(saved)
                if (s.본부) set선택본부(s.본부)
                if (s.부서) set선택부서(s.부서)
                if (s.팀) set선택팀(s.팀)
                if (s.매장) set선택매장(s.매장)
                if (s.사번) set사번(s.사번)
                if (s.이름) set이름(s.이름)
                if (s.관리감독자) set관리감독자(s.관리감독자)
            }
        } catch { }
    }, [])

    function saveToLocalStorage(updates: Record<string, string>) {
        try {
            const existing = JSON.parse(localStorage.getItem('jsa_last_selection') || '{}')
            localStorage.setItem('jsa_last_selection', JSON.stringify({ ...existing, ...updates }))
        } catch { }
    }

    async function fetchWorkers() {
        try {
            const res = await fetch('/api/workers')
            const data = await res.json()
            if (data.data && data.data.length > 0) {
                // 사용 안함 (사번/이름 직접 입력으로 대체)
            }
        } catch { }
    }

    // 다중 선택된 작업명들을 기반으로 steps 병합
    function handleMasterWorkSelect(selectedMWorks: string[]) {
        set선택작업명목록(selectedMWorks)

        if (selectedMWorks.length === 0) {
            setSteps([{ 단계번호: 1, 작업내용: '', 분석중: false }])
            return
        }

        let newSteps: WorkStep[] = []
        selectedMWorks.forEach(workName => {
            const masterSteps = MASTER_WORKS[workName] || []
            newSteps = [...newSteps, ...masterSteps.map(s => ({
                단계번호: 0, // 임시
                작업내용: `[${workName}] ${s.세부작업단계}`,
                분석중: false,
                분석결과: {
                    유해위험요인: s.유해위험요인,
                    개선대책: s.안전조치사항,
                },
            }))]
        })

        // 단계번호 재정렬
        setSteps(newSteps.map((s, i) => ({ ...s, 단계번호: i + 1 })))
    }

    // 매장 선택 시 산업재해 이력 매핑 및 기본 작업 설정
    useEffect(() => {
        const targetStore = 선택매장 || 직접입력매장
        if (targetStore && MOCK_ACCIDENTS[targetStore]) {
            const acc = MOCK_ACCIDENTS[targetStore]
            set재해이력(acc)
            // 기존 선택 목록에 재해 연관 작업명이 없으면 추가
            if (!선택작업명목록.includes(acc.작업명) && MASTER_WORKS[acc.작업명]) {
                handleMasterWorkSelect([...선택작업명목록, acc.작업명])
            }
        } else {
            set재해이력(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [선택매장, 직접입력매장])

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
        const 작성자명 = (이름 && 사번) ? `${이름}(${사번})` : ''

        if (!매장 || !이름 || !사번 || 선택작업명목록.length === 0) {
            setSaveError('매장명, 사번, 이름, 작업명은 필수 입력 항목입니다.')
            return
        }
        if (선택작업명목록.length < 3) {
            setSaveError('작업명은 최소 3개 이상 선택해야 합니다.')
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
                    사진_조치전_url: step.이미지URL || null,
                    사진_조치후_url: step.조치후이미지URL || null,
                    유해위험요인: step.유해위험요인 || step.분석결과?.유해위험요인 || null,
                    위험등급: step.조치전위험등급 || step.분석결과?.위험등급 || null,
                    조치전위험등급: step.조치전위험등급 || step.분석결과?.위험등급 || null,
                    조치후위험등급: step.조치후위험등급 || null,
                    예산사용내역: step.예산사용내역 || null,
                    개선조치완료일자: step.조치완료일자 || null,
                    유형: step.분석결과?.유형 || null,
                    개선대책: step.개선대책 || step.분석결과?.개선대책 || null,
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
    }, [saving, 선택매장, 직접입력매장, 이름, 사번, 선택작업명목록, 작업명, steps, 선택본부, 선택부서, 선택팀, 관리감독자, 참여근로자, 작업일시])

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
                                    onChange={e => {
                                        set선택본부(e.target.value)
                                        set선택부서('')
                                        set선택팀('')
                                        set선택매장('')
                                        saveToLocalStorage({ 본부: e.target.value, 부서: '', 팀: '', 매장: '' })
                                    }}
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
                                    onChange={e => {
                                        set선택부서(e.target.value)
                                        set선택팀('')
                                        set선택매장('')
                                        saveToLocalStorage({ 부서: e.target.value, 팀: '', 매장: '' })
                                    }}
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
                                    onChange={e => {
                                        set선택팀(e.target.value)
                                        set선택매장('')
                                        saveToLocalStorage({ 팀: e.target.value, 매장: '' })
                                    }}
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
                                        onChange={e => {
                                            set선택매장(e.target.value)
                                            saveToLocalStorage({ 매장: e.target.value })
                                        }}
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
                            <label className="form-label">사번 *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="예: AD0000000"
                                value={사번}
                                onChange={e => {
                                    set사번(e.target.value)
                                    saveToLocalStorage({ 사번: e.target.value })
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">이름 *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="성함 입력"
                                value={이름}
                                onChange={e => {
                                    set이름(e.target.value)
                                    saveToLocalStorage({ 이름: e.target.value })
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">관리감독자</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="관리감독자 성함"
                                value={관리감독자}
                                onChange={e => set관리감독자(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">참여 근로자</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="참여 근로자 정보"
                                value={참여근로자}
                                onChange={e => set참여근로자(e.target.value)}
                            />
                        </div>

                        {/* 산업재해 이력 알림 */}
                        {재해이력 && (
                            <div style={{ gridColumn: '1 / -1', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '0.2rem' }}>
                                <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
                                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                    <span>해당 매장은 과거 <strong>{재해이력.작업명}</strong> 중 <strong>{재해이력.재해유형}</strong> 재해 이력이 있습니다. (발생일: {재해이력.발생일}) 평가에 반드시 참고해주세요.</span>
                                </p>
                            </div>
                        )}

                        {/* 작업명: 마스터 선택 멀티 체크박스 */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">작업명 * (최소 3개 이상 선택)</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px'
                            }}>
                                {Object.keys(MASTER_WORKS).map(work => (
                                    <label key={work} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={선택작업명목록.includes(work)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    handleMasterWorkSelect([...선택작업명목록, work])
                                                } else {
                                                    handleMasterWorkSelect(선택작업명목록.filter(w => w !== work))
                                                }
                                            }}
                                            style={{
                                                width: '16px', height: '16px',
                                                accentColor: '#3b82f6',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span style={{ color: '#e2e8f0' }}>{work}</span>
                                    </label>
                                ))}
                            </div>
                            {선택작업명목록.length > 0 && 선택작업명목록.length < 3 && (
                                <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={14} /> 현재 {선택작업명목록.length}개 선택됨. 3개 이상 선택하세요.
                                </p>
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

                                {/* ── 조치 전 사진 (AI 분석용) ── */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            📷 조치 전 사진 (위험 상태)
                                        </label>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                        >
                                            <Upload size={12} /> 추가
                                        </button>
                                        <input
                                            ref={el => { fileInputRefs.current[idx] = el }}
                                            type="file" accept="image/*" capture="environment"
                                            style={{ display: 'none' }}
                                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(idx, f) }}
                                        />
                                    </div>
                                    {step.이미지미리보기 ? (
                                        <div style={{ position: 'relative', width: '100px', height: '75px' }}>
                                            <img src={step.이미지미리보기} alt="조치전" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f59e0b' }} />
                                            <button onClick={() => updateStep(idx, { 이미지파일: undefined, 이미지미리보기: undefined, 이미지URL: undefined })} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={9} /></button>
                                        </div>
                                    ) : (
                                        <div onClick={() => fileInputRefs.current[idx]?.click()} style={{ height: '60px', border: '1px dashed #f59e0b44', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.72rem' }}>사진 없음 (클릭하여 추가)</div>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>위험등급</label>
                                        <select
                                            className="form-input"
                                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                            value={step.조치전위험등급 ?? step.분석결과?.위험등급 ?? ''}
                                            onChange={e => updateStep(idx, { 조치전위험등급: e.target.value })}
                                        >
                                            <option value="">선택</option>
                                            <option value="상">상</option>
                                            <option value="중">중</option>
                                            <option value="하">하</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>유해위험요인</label>
                                        <textarea
                                            className="form-input"
                                            style={{ fontSize: '0.8rem', padding: '0.5rem', minHeight: '38px', resize: 'none' }}
                                            value={step.유해위험요인 ?? step.분석결과?.유해위험요인 ?? ''}
                                            onChange={e => updateStep(idx, { 유해위험요인: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* ── 조치 후 사진 ── */}
                                <div style={{ marginBottom: step.분석결과 ? '1rem' : '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            ✅ 조치 후 사진 (안전 상태)
                                        </label>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}
                                            onClick={() => fileInputAfterRefs.current[idx]?.click()}
                                        >
                                            <Upload size={12} /> 추가
                                        </button>
                                        <input
                                            ref={el => { fileInputAfterRefs.current[idx] = el }}
                                            type="file" accept="image/*" capture="environment"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const f = e.target.files?.[0]
                                                if (!f) return
                                                const url = URL.createObjectURL(f)
                                                updateStep(idx, { 조치후이미지파일: f, 조치후이미지미리보기: url })
                                                // 조치 후 사진도 Supabase에 업로드
                                                const form = new FormData()
                                                form.append('image', f)
                                                form.append('작업명', 작업명)
                                                form.append('작업내용', steps[idx].작업내용)
                                                form.append('매장명', 선택매장 || 직접입력매장)
                                                form.append('조치후', 'true')
                                                fetch('/api/jsa/analyze', { method: 'POST', body: form })
                                                    .then(r => r.json())
                                                    .then(d => { if (d.imageUrl) updateStep(idx, { 조치후이미지URL: d.imageUrl }) })
                                                    .catch(() => { })
                                            }}
                                        />
                                    </div>
                                    {step.조치후이미지미리보기 ? (
                                        <div style={{ position: 'relative', width: '100px', height: '75px' }}>
                                            <img src={step.조치후이미지미리보기} alt="조치후" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #34d399' }} />
                                            <button onClick={() => updateStep(idx, { 조치후이미지파일: undefined, 조치후이미지미리보기: undefined, 조치후이미지URL: undefined })} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={9} /></button>
                                        </div>
                                    ) : (
                                        <div onClick={() => fileInputAfterRefs.current[idx]?.click()} style={{ height: '60px', border: '1px dashed #34d39944', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.72rem' }}>사진 없음 (클릭하여 추가)</div>
                                    )}
                                </div>

                                {/* AI 분석 버튼 */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: step.분석결과 ? '1rem' : '0' }}>
                                    <button
                                        className="btn"
                                        style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white' }}
                                        onClick={() => analyzeWithoutImage(idx)}
                                        disabled={step.분석중 || !step.작업내용}
                                    >
                                        {step.분석중 ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                                        {step.분석중 ? 'AI 분석 中...' : 'AI 위험도 분석'}
                                    </button>
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
        </div >
    )
}
