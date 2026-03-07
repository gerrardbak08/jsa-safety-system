'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SafetyInspectionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string>('step1')
  const [inspector, setInspector] = useState<string>('')
  
  // App States
  const [hq, setHq] = useState('')
  const [dept, setDept] = useState('')
  const [team, setTeam] = useState('')
  const [store, setStore] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [currentCategory, setCurrentCategory] = useState('')

  const inspectors = ['Kang (안전)', 'Park (안전)', 'Yoo (안전)', 'Seo (안전)', 'Park (보건)', 'Yoon (보건)']
  const categories = ["TBM", "넘어짐", "물체맞음", "떨어짐", "베임(칼)", "끼임", "깔림", "무리한동작", "기타 건강장해", "기타사항"]
  const categoryEmojis: Record<string, string> = {
    "TBM": "📢", "넘어짐": "🏃", "물체맞음": "📦", "떨어짐": "🪜", 
    "베임(칼)": "🔪", "끼임": "⚙️", "깔림": "🚜", "무리한동작": "🏋️", 
    "기타 건강장해": "🏥", "기타사항": "📝"
  }

  const handleInspectorSelect = (name: string) => {
    setInspector(name)
    setCurrentStep('stepDash')
  }

  const hqList = ['강북영업본부', '강남영업본부'] // Placeholder

  return (
    <div className="container min-h-screen relative pb-20">
      
      {/* STEP 1: Inspector Selection */}
      {currentStep === 'step1' && (
        <div className="fade-in">
          <h2>안전 점검 시스템</h2>
          
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', textAlign: 'right' }}>📊 누적 점검 현황</div>
          <table className="summary-table">
            <thead>
              <tr><th>순위</th><th>점검자</th><th>위험요인 도출</th></tr>
            </thead>
            <tbody>
              {/* Dummy data */}
              <tr className="rank-1"><td>1위</td><td>Kang (안전)</td><td>15건</td></tr>
              <tr><td>2위</td><td>Park (안전)</td><td>12건</td></tr>
              <tr><td>3위</td><td>Yoo (안전)</td><td>8건</td></tr>
            </tbody>
          </table>
          
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>👤 점검자 선택</div>
          <div id="inspectorList">
            {inspectors.map(name => (
              <div key={name} className="btn-select" onClick={() => handleInspectorSelect(name)}>
                {name}
              </div>
            ))}
          </div>
          
          <button className="btn-sub" onClick={() => router.push('/')} style={{ marginTop: '10px' }}>
            ◀ 메인 메뉴로
          </button>
        </div>
      )}

      {/* STEP Dash: User Dashboard */}
      {currentStep === 'stepDash' && (
        <div className="fade-in">
          <h2>{inspector}님 대시보드</h2>
          
          <div className="dash-card">
            <div className="dash-item"><span>0</span><label>방문 매장수</label></div>
            <div className="dash-item"><span>0</span><label>위험요인 도출</label></div>
          </div>
          
          <button className="btn-main" onClick={() => setCurrentStep('step2')}>🚀 새로운 점검 시작</button>
          <button className="btn-sub" onClick={() => setCurrentStep('stepHistory')}>📅 달력으로 이력 확인</button>
          <button className="btn-sub" onClick={() => setCurrentStep('step1')} style={{ border: 'none', color: 'var(--blue)' }}>
            ◀ 뒤로 가기
          </button>
        </div>
      )}

      {/* STEP History: Calendar & History */}
      {currentStep === 'stepHistory' && (
        <div className="fade-in">
          <h2>📅 점검 데이터 분석</h2>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', color: 'var(--blue)' }}>
              📋 점검 등급 기준표 (총 72문항)
            </div>
            {/* Table placeholder */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', padding: '20px 0' }}>등급 기준표 영역 (추후 구현)</div>
          </div>
          
          <div id="calendar" style={{ textAlign: 'center', padding: '30px 0' }}>
            [FullCalendar 영역 - 연동 대기]
          </div>
          
          <button className="btn-main" onClick={() => setCurrentStep('stepDash')} style={{ background: '#5f6368' }}>
            ◀ 뒤로 가기
          </button>
        </div>
      )}

      {/* STEP 2: Store Selection */}
      {currentStep === 'step2' && (
        <div className="fade-in">
          <h2>점검 정보 입력</h2>
          
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          
          <select value={hq} onChange={(e) => setHq(e.target.value)}>
             <option value="">영업본부 선택</option>
             {hqList.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
             <option value="">부서 선택</option>
             <option value="test-dept">가상 부서</option>
          </select>
          
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
             <option value="">팀 선택</option>
             <option value="test-team">가상 팀</option>
          </select>
          
          <select value={store} onChange={(e) => setStore(e.target.value)}>
             <option value="">매장 선택</option>
             <option value="test-store">가상 매장</option>
          </select>
          
          <button className="btn-main" onClick={() => setCurrentStep('step3')}>점검 시작 ➔</button>
          <button className="btn-sub" onClick={() => setCurrentStep('stepDash')}>이전으로</button>
        </div>
      )}

      {/* STEP 3: Categories */}
      {currentStep === 'step3' && (
        <div className="fade-in">
          <h2>점검 카테고리</h2>
          <div id="menuDiv">
             {categories.map(cat => (
               <div key={cat} className="btn-select" onClick={() => {
                 setCurrentCategory(cat)
                 setCurrentStep('step4')
               }}>
                  {categoryEmojis[cat] || "📝"} {cat}
               </div>
             ))}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-sub" style={{ flex: 1 }} onClick={() => setCurrentStep('step2')}>◀ 이전으로</button>
            <button className="btn-main" style={{ flex: 1, background: 'var(--green)' }} onClick={() => setCurrentStep('stepSuccess')}>최종 제출</button>
          </div>
        </div>
      )}

      {/* STEP 4: Questions */}
      {currentStep === 'step4' && (
        <div className="fade-in">
          <h2>{currentCategory} 상세 점검</h2>
          
          <div className="q-card">
             <span style={{ fontWeight: 'bold' }}>1. 가상의 테스트 질문 항목입니다.</span>
             <div className="guide-box">
                <b>[판정]</b> 양호 판단 기준<br/>
                <b>[세부]</b> 상세 조치 사항 및 체크 리스트
             </div>
             <div className="score-row">
                <label><input type="radio" name="g1" value="3" defaultChecked /><span>양호</span></label>
                <label><input type="radio" name="g1" value="2" /><span>보통</span></label>
                <label><input type="radio" name="g1" value="1" /><span>미흡</span></label>
             </div>
             
             <textarea className="remark" style={{ height: '60px', marginTop: '10px' }} placeholder="비고 입력"></textarea>
             
             <div className="jsa-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', color: '#555' }}>📸 현장 사진</span>
                <button type="button" className="btn-sub" style={{ width: 'auto', padding: '5px 10px', margin: 0, fontSize: '12px' }}>➕ 사진 첨부</button>
             </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-sub" style={{ flex: 1 }} onClick={() => setCurrentStep('step3')}>목차로</button>
            <button className="btn-main" style={{ flex: 1 }} onClick={() => setCurrentStep('step3')}>임시저장</button>
          </div>
        </div>
      )}
      
      {/* STEP Success */}
      {currentStep === 'stepSuccess' && (
        <div className="fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ color: '#1a73e8', marginBottom: '10px', fontSize: '22px' }}>점검 완료!</h2>
          <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, marginBottom: '30px' }}>
            안전보건점검 결과가<br/>성공적으로 저장되었습니다.
          </p>
          <div className="btn-area">
            <button className="btn-main" onClick={() => router.push('/')}>🏠 첫 페이지로 돌아가기</button>
          </div>
        </div>
      )}

    </div>
  )
}
