'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AiAnalysisPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string>('stepAI_Start')
  
  // App States
  const [inspector, setInspector] = useState<string>('')
  const [hq, setHq] = useState('')
  const [dept, setDept] = useState('')
  const [team, setTeam] = useState('')
  const [store, setStore] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  // AI Detail States
  const [taskName, setTaskName] = useState('')
  const [grade, setGrade] = useState('')
  const [totalScore, setTotalScore] = useState('')
  const [fullText, setFullText] = useState('')
  const [comment, setComment] = useState('')
  const [imageB64, setImageB64] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const inspectors = ['Kang (안전)', 'Park (보건)', 'Park (안전)', 'Seo (안전)', 'Yoo (안전)', 'Yoon (보건)']

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'ai_analysis');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setImageB64(data.url);
      else alert('Upload failed: ' + data.error);
    } catch (err: any) { alert('Error: ' + err.message); } finally { setIsUploading(false); }
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        date,
        inspector,
        hq,
        dept,
        team,
        store,
        taskName,
        totalScore,
        grade,
        fullText,
        comment,
        imageB64
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '저장 실패');

      setCurrentStep('stepAI_Success');
    } catch (err: any) {
      alert('저장 중 오류가 발생했습니다:\n' + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container min-h-screen relative pb-20">
      
      {/* STEP AI Start */}
      {currentStep === 'stepAI_Start' && (
        <div className="fade-in">
          <h2 className="jsa-title" style={{ color: '#8e24aa', borderColor: '#8e24aa' }}>🤖 AI 근골격계 위험 분석</h2>
          
          <div className="jsa-label">👤 점검자 선택</div>
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

          <div className="jsa-label">📅 점검 일자</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />

          <div className="jsa-label">🏢 점검 매장 선택</div>
          <select value={hq} onChange={(e) => setHq(e.target.value)}><option value="">-- 본부 --</option><option value="hq1">가상 본부</option></select>
          <select value={dept} onChange={(e) => setDept(e.target.value)}><option value="">-- 부서 --</option><option value="d1">가상 부서</option></select>
          <select value={team} onChange={(e) => setTeam(e.target.value)}><option value="">-- 팀 --</option><option value="t1">가상 팀</option></select>
          <select value={store} onChange={(e) => setStore(e.target.value)}><option value="">-- 매장 --</option><option value="s1">가상 매장</option></select>

          <button className="btn-main" onClick={() => {
            if(!inspector || !store) return alert('점검자와 매장을 선택해주세요.')
            setCurrentStep('stepAI_Detail')
          }} style={{ marginTop: '30px', background: '#8e24aa' }}>
            다음 페이지로 이동 ➔
          </button>
          
          <button className="btn-sub" onClick={() => router.push('/')}>◀ 메인 메뉴로</button>
        </div>
      )}

      {/* STEP AI Detail */}
      {currentStep === 'stepAI_Detail' && (
        <div className="fade-in">
          <h2 className="jsa-title" style={{ color: '#8e24aa', borderColor: '#8e24aa' }}>📷 AI 근골격계 위험 분석</h2>
          
          <div className="jsa-label" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📸 1. 현장 작업 사진 (1장 등록)</span>
            {isUploading && <span style={{fontSize: '12px', color: '#8e24aa'}}>업로드 중...</span>}
            <input type="file" id="aiCam" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileUpload} />
            <label htmlFor="aiCam" className="btn-sub" style={{ width: 'auto', padding: '5px 10px', margin: 0, fontSize: '12px', cursor: 'pointer', display: 'inline-block' }}>➕ 사진 추가</label>
          </div>
          {imageB64 && (
            <div style={{ marginTop: '10px' }}>
              <img src={imageB64} alt="Preview" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
          )}
          
          <div className="jsa-label">🛠️ 2. 대상 작업명</div>
          <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="예: 매대 하단 진열, 음료 박스 하차 등" />

          <div className="jsa-label">⚖️ 3. 취급 물품 무게</div>
          <select>
            <option value="없음">들고 있는 물건 없음 (맨손)</option>
            <option value="가벼움">5kg 미만 (가벼움)</option>
            <option value="보통">5kg ~ 10kg 미만 (보통)</option>
            <option value="무거움">10kg 이상 (고중량 위험)</option>
          </select>

          <div className="jsa-label">🤸‍♂️ 4. 작업 전 스트레칭 여부</div>
          <select>
            <option value="안함">실시하지 않음 (위험도 가중)</option>
            <option value="작업전">작업 전 1회 실시 (보통)</option>
            <option value="주기적">주기적 실시 (위험도 완화)</option>
          </select>

          <div className="jsa-label" style={{ marginTop: '20px' }}>🏪 매장 환경 & AI 종합 분석</div>
          
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input type="text" placeholder="매장명 검색" style={{ flex: 1.5, height: '36px', padding: '0 10px', borderRadius: '5px' }} />
            <select style={{ flex: 1, height: '36px', padding: '0 5px', fontSize: '13px' }}>
              <option value="정규직">정규/임시(8H)</option>
              <option value="파트직">파트직(6.5H)</option>
            </select>
            <select style={{ flex: 1, height: '36px', padding: '0 5px', fontSize: '13px' }}>
              <option value="일반">일반 작업</option>
              <option value="입고">입고 작업</option>
            </select>
          </div>

          <textarea rows={10} value={fullText} onChange={e => setFullText(e.target.value)} placeholder="메장 정보를 검색하고 사진을 올리면 AI가 분석합니다." style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #dadce0', background: '#f8f9fa', fontWeight: 'bold', fontSize: '14px', lineHeight: 1.6, resize: 'none', boxSizing: 'border-box' }}></textarea>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div className="jsa-label">📊 위험 등급</div>
              <select value={grade} onChange={e => setGrade(e.target.value)}>
                <option value="">-- 등급 --</option>
                <option value="상">상 (개선 필요)</option>
                <option value="중">중 (계획 개선)</option>
                <option value="하">하 (현상 유지)</option>
              </select>
            </div>
            <div>
              <div className="jsa-label">💯 위험도 점수</div>
              <input type="text" value={totalScore} onChange={e => setTotalScore(e.target.value)} placeholder="AI 자동 계산" style={{ background: '#f1f3f4', fontWeight: 'bold', color: '#c62828', textAlign: 'center' }} />
            </div>
          </div>

          <div className="jsa-label">📝 점검자 종합 의견</div>
          <textarea className="remark" value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="AI 분석 결과를 바탕으로 한 개선 대책을 적어주세요."></textarea>

          <div className="btn-area">
            <button type="button" className="btn-main" disabled={isLoading} onClick={handleSave} style={{ background: '#8e24aa' }}>
                {isLoading ? '분석 저장 중...' : '🚀 AI 분석 결과 저장'}
            </button>
            <button type="button" className="btn-sub" onClick={() => setCurrentStep('stepAI_Start')}>◀ 이전 화면으로 돌아가기</button>
          </div>
        </div>
      )}

      {/* STEP AI Success */}
      {currentStep === 'stepAI_Success' && (
        <div className="fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ color: '#8e24aa', marginBottom: '10px', fontSize: '22px' }}>분석 및 저장 완료!</h2>
          <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, marginBottom: '30px' }}>
            AI 근골격계 분석 결과가<br/>성공적으로 저장되었습니다.
          </p>
          <div className="btn-area">
            <button type="button" className="btn-main" style={{ background: '#8e24aa', fontSize: '15px', padding: '12px' }} onClick={() => router.push('/')}>
              🏠 메인 메뉴로 이동
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
