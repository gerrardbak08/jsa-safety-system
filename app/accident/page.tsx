'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccidentInvestigationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string>('stepAccident_Main')
  
  // States
  const [inspector, setInspector] = useState<string>('')
  const [hq, setHq] = useState('')
  const [dept, setDept] = useState('')
  const [team, setTeam] = useState('')
  const [store, setStore] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  
  // Accident Detail States
  const [accidentDate, setAccidentDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [accidentType, setAccidentType] = useState('')
  const [accidentContent, setAccidentContent] = useState('')
  const [agency, setAgency] = useState('')
  const [hazard, setHazard] = useState('')
  const [riskGrade, setRiskGrade] = useState('상')
  const [status, setStatus] = useState('미조치')
  const [comment, setComment] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)

  const inspectors = ['Kang (안전)', 'Park (보건)', 'Park (안전)', 'Seo (안전)', 'Yoo (안전)', 'Yoon (보건)']

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        checkDate: date,
        inspector,
        hq,
        dept,
        team,
        store,
        accidentDate,
        accidentType,
        accidentContent,
        agency,
        hazard,
        risk: riskGrade,
        status,
        comment,
        imgAgency: '', // photo URLs handles later via Supabase Storage
        imgAction: '',
      };

      const res = await fetch('/api/accident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '저장 실패');

      setCurrentStep('stepAccident_Success');
    } catch (err: any) {
      alert('저장 중 오류가 발생했습니다:\n' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-screen relative pb-20">
      
      {/* STEP Main: Accident Management */}
      {currentStep === 'stepAccident_Main' && (
        <div className="fade-in">
          <h2 className="jsa-title" style={{ color: '#c62828', borderColor: '#c62828' }}>🚑 사고관리 시스템</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '40px' }}>
            
            <div className="btn-select" style={{ padding: '40px 20px', fontSize: '18px', borderColor: '#c62828', color: '#c62828' }} onClick={() => setCurrentStep('stepAccident_Start')}>
              <span style={{ fontSize: '40px', marginBottom: '10px' }}>📝</span>사고원인조사<br/>(신규 작성)
            </div>

            <div className="btn-select" style={{ padding: '40px 20px', fontSize: '18px', borderColor: '#ff8f00', color: '#ff8f00' }} onClick={() => setCurrentStep('stepAccident_History')}>
               <span style={{ fontSize: '40px', marginBottom: '10px' }}>✅</span>이행상태 점검<br/>(조치 결과 관리)
            </div>

          </div>
          <button className="btn-sub" onClick={() => router.push('/')} style={{ marginTop: '30px', width: '100%' }}>◀ 메인 메뉴로</button>
        </div>
      )}

      {/* STEP Start: Investigation Overview */}
      {currentStep === 'stepAccident_Start' && (
        <div className="fade-in">
          <h2 style={{ color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: '10px' }}>🚑 사고조사 개요</h2>
          
          <div className="jsa-label">👤 작성자 선택</div>
          <div className="jsa-grid">
            {inspectors.map(name => (
              <div 
                key={name} 
                className={`jsa-grid-btn ${inspector === name ? 'selected' : ''}`} 
                onClick={() => setInspector(name)}
              >
                {name}
              </div>
            ))}
          </div>

          <div className="jsa-label">📅 조사 일자 (오늘 날짜)</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="jsa-label">🏢 사고 발생 매장 선택</div>
          <select value={hq} onChange={(e) => setHq(e.target.value)}><option value="">-- 본부 --</option><option value="hq1">가상 본부</option></select>
          <select value={dept} onChange={(e) => setDept(e.target.value)}><option value="">-- 부서 --</option><option value="d1">가상 부서</option></select>
          <select value={team} onChange={(e) => setTeam(e.target.value)}><option value="">-- 팀 --</option><option value="t1">가상 팀</option></select>
          <select value={store} onChange={(e) => setStore(e.target.value)}><option value="">-- 매장 --</option><option value="s1">가상 매장</option></select>

          <button type="button" className="btn-sub" style={{ marginTop: '15px', background: '#e8f0fe', borderColor: '#1a73e8', color: '#1a73e8', width: '100%', padding: '15px', fontSize: '15px' }} 
                onClick={() => {
                  if(!inspector) return alert('작성자를 선택하세요.');
                  if(!store) return alert('매장을 선택하세요.');
                  setCurrentStep('stepAccident_Detail')
                }}>
            ✨ 이력에 없는 신규 사고 직접 입력하기
          </button>

          <div id="accListArea" style={{ marginTop: '20px' }}>
            <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '20px' }}>
              매장을 선택하면 사고 내역이 표시됩니다.
            </div>
          </div>

          <button className="btn-sub" onClick={() => setCurrentStep('stepAccident_Main')} style={{ marginTop: '20px' }}>◀ 이전 단계로</button>
        </div>
      )}

      {/* STEP Detail: Causal analysis and safety check */}
      {currentStep === 'stepAccident_Detail' && (
        <div className="fade-in">
          <h2 style={{ color: '#c62828' }}>📝 상세 원인분석 및 점검</h2>
          
          <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #ffcdd2', marginBottom: '20px' }}>
             <div style={{ marginBottom: '8px', fontSize: '14px' }}>
               <span style={{ background: '#34a853', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '12px' }}>신규 수기 입력</span>
               <span style={{ color: '#666', fontWeight: 'bold', marginLeft: '5px' }}>{store || '매장 정보 없음'}</span>
             </div>
             
             <div className="jsa-label" style={{ fontSize: '13px', marginTop: '10px' }}>📅 사고 발생일</div>
             <input type="date" value={accidentDate} onChange={e => setAccidentDate(e.target.value)} style={{ marginBottom: '5px', height: '40px' }} />
             
             <div className="jsa-label" style={{ fontSize: '13px' }}>🚨 재해 유형</div>
             <input type="text" value={accidentType} onChange={e => setAccidentType(e.target.value)} placeholder="예: 넘어짐, 베임, 끼임 등" style={{ marginBottom: '5px', height: '40px' }} />
             
             <div className="jsa-label" style={{ fontSize: '13px' }}>📝 사고 내용</div>
             <textarea className="remark" value={accidentContent} onChange={e => setAccidentContent(e.target.value)} rows={2} placeholder="사고 발생 경위를 상세히 입력하세요."></textarea>
          </div>

          <div className="q-card" style={{ borderLeft: '5px solid #c62828' }}>
             <div className="jsa-label" style={{ marginTop: 0 }}>🔍 사고원인 (물질/설비/개인부주의 등)</div>
             <input type="text" value={agency} onChange={e => setAgency(e.target.value)} placeholder="예: 사다리, 롤테이너, 칼 등" style={{ marginBottom: '10px' }} />
             
             <div className="jsa-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📸 기인물 사진</span>
                <button type="button" className="btn-sub" style={{ width: 'auto', padding: '5px 10px', margin: 0, fontSize: '12px' }}>➕ 사진 첨부</button>
             </div>
             
             <div className="jsa-label">⚠️ 유해위험요인</div>
             <textarea className="remark" value={hazard} onChange={e => setHazard(e.target.value)} rows={3} placeholder="어떤 점이 위험했는지 작성하세요."></textarea>
             
             <div className="jsa-label">📊 위험등급</div>
             <select value={riskGrade} onChange={e => setRiskGrade(e.target.value)}>
                <option value="상">상 (즉시 개선 필요)</option>
                <option value="중">중 (계획 개선)</option>
                <option value="하">하 (현상 유지/관리)</option>
             </select>
          </div>

          <div className="q-card" style={{ borderLeft: '5px solid #ff8f00' }}>
             <div className="jsa-label" style={{ marginTop: 0 }}>✅ 이행 상태 확인</div>
             <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="조치완료">조치 완료 (양호)</option>
                <option value="진행중">개선 진행 중</option>
                <option value="미조치">미조치 (즉시 조치 요망)</option>
             </select>
             
             <div className="jsa-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📸 조치(이행) 결과 사진</span>
                <button type="button" className="btn-sub" style={{ width: 'auto', padding: '5px 10px', margin: 0, fontSize: '12px' }}>➕ 추가</button>
             </div>
             
             <div className="jsa-label">📝 점검 의견</div>
             <textarea className="remark" value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="점검자 의견을 입력하세요."></textarea>
          </div>

          <div className="btn-area">
            <button type="button" className="btn-main" disabled={isLoading} onClick={handleSave} style={{ background: '#c62828' }}>
               {isLoading ? '저장 중...' : '💾 점검 결과 저장'}
            </button>
            <button type="button" className="btn-sub" onClick={() => setCurrentStep('stepAccident_Start')}>⬅ 이전 화면으로 돌아가기</button>
          </div>
        </div>
      )}

      {/* STEP Success */}
      {currentStep === 'stepAccident_Success' && (
        <div className="fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ color: '#c62828', marginBottom: '10px', fontSize: '22px' }}>저장 완료!</h2>
          <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, marginBottom: '30px' }}>
            사고 원인 조사 및 점검 내용이<br/>성공적으로 저장되었습니다.
          </p>
          
          <div className="btn-area">
            <button type="button" className="btn-main" style={{ background: '#1a73e8', fontSize: '15px', padding: '12px' }} onClick={() => router.push('/')}>
               🏠 메인 메뉴로 이동
            </button>
          </div>
        </div>
      )}

      {/* STEP History */}
      {currentStep === 'stepAccident_History' && (
        <div className="fade-in">
          <h2 className="jsa-title" style={{ color: '#ff8f00', borderColor: '#ff8f00' }}>📅 조치 결과 관리</h2>
          <div style={{ marginBottom: '20px', fontSize: '11px', background: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #eee', textAlign: 'center', minHeight: '300px' }}>
             [FullCalendar 영역 - 연동 대기]
          </div>
          <button className="btn-sub" onClick={() => setCurrentStep('stepAccident_Main')} style={{ marginTop: '20px', width: '100%' }}>◀ 이전으로</button>
        </div>
      )}

    </div>
  )
}
