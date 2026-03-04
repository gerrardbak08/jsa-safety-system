'use client'

import Link from 'next/link'
import { Shield, ClipboardList, AlertTriangle, BarChart2, Activity } from 'lucide-react'

const modules = [
  {
    id: 1,
    icon: <ClipboardList size={32} />,
    title: 'JSA 위험성평가',
    subtitle: 'Job Safety Analysis',
    description: '작업 단계별 위험요인 파악 및 AI 자동분석',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    glow: 'rgba(59,130,246,0.3)',
    href: '/jsa',
    active: true,
  },
  {
    id: 2,
    icon: <Shield size={32} />,
    title: '안전보건점검',
    subtitle: 'Safety Inspection',
    description: '매장별 안전점검 현황 및 랭킹 대시보드',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    glow: 'rgba(6,182,212,0.3)',
    href: '#',
    active: false,
  },
  {
    id: 3,
    icon: <AlertTriangle size={32} />,
    title: '사고원인조사',
    subtitle: 'Accident Investigation',
    description: '사고 발생 원인 분석 및 재발방지 대책',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    glow: 'rgba(239,68,68,0.3)',
    href: '#',
    active: false,
  },
  {
    id: 4,
    icon: <BarChart2 size={32} />,
    title: '전국 산재 통계',
    subtitle: 'National Accident Stats',
    description: '산업재해 통계 및 업종별 위험요인 분석',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    glow: 'rgba(167,139,250,0.3)',
    href: '#',
    active: false,
  },
  {
    id: 5,
    icon: <Activity size={32} />,
    title: 'AI 근골격계 분석',
    subtitle: 'AI Musculoskeletal Analysis',
    description: '현장 사진으로 Gemini AI가 위험도 자동 분석',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    glow: 'rgba(245,158,11,0.3)',
    href: '#',
    active: false,
  },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, rgba(30,64,175,0.3) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-50%', right: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'var(--gradient-blue)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
            }}>
              <Shield size={26} color="white" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fff 0%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}>
                안전보건 통합관리시스템
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Integrated Safety & Health Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>
          모듈을 선택하여 시작하세요
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}>
          {modules.map((mod, i) => (
            <Link
              key={mod.id}
              href={mod.active ? mod.href : '#'}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="fade-in"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${mod.active ? 'var(--border-hover)' : 'var(--border)'}`,
                  borderRadius: '20px',
                  padding: '1.75rem',
                  cursor: mod.active ? 'pointer' : 'not-allowed',
                  opacity: mod.active ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  animationDelay: `${i * 0.05}s`,
                }}
                onMouseEnter={e => {
                  if (!mod.active) return
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = `0 12px 40px ${mod.glow}`
                  el.style.borderColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = ''
                  el.style.boxShadow = ''
                  el.style.borderColor = mod.active ? 'var(--border-hover)' : 'var(--border)'
                }}
              >
                {/* Top gradient bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: mod.gradient,
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', flexShrink: 0,
                    background: mod.gradient,
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 15px ${mod.glow}`,
                    color: 'white',
                  }}>
                    {mod.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {mod.title}
                      </h2>
                      {mod.active ? (
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>활성</span>
                      ) : (
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>준비중</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {mod.subtitle}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.5 }}>
                      {mod.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          marginTop: '3rem',
          opacity: 0.6,
        }}>
          Powered by Next.js · Supabase · Gemini AI
        </p>
      </div>
    </div>
  )
}
