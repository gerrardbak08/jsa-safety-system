'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginTop: '30px' }}>안전보건 통합관리시스템</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '40px', marginBottom: '40px' }}>
        
        <div className="btn-select" style={{ padding: '35px 10px', fontSize: '16px' }} onClick={() => router.push('/jsa')}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>📋</span>JSA 위험성평가
        </div>
        
        <div className="btn-select" style={{ padding: '35px 10px', fontSize: '16px' }} onClick={() => router.push('/safety')}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</span>안전보건점검
        </div>

        <div className="btn-select" style={{ padding: '35px 10px', fontSize: '16px' }} onClick={() => router.push('/accident')}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>🚑</span>사고원인조사
        </div>

        <div className="btn-select" style={{ padding: '35px 10px', fontSize: '16px' }} onClick={() => router.push('/stats')}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>🗺️</span>전국 산재 통계
        </div>
        
        <div className="btn-select" style={{ padding: '35px 10px', fontSize: '16px', borderColor: '#8e24aa', color: '#8e24aa' }} onClick={() => router.push('/ai')}>
          <span style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</span>AI 근골격계<br />위험 분석
        </div>
      </div>
    </div>
  )
}
