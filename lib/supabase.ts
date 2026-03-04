import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Organization {
  id: number
  영업본부: string
  부서명: string
  팀명: string
  매장명: string
}

export interface JsaMaster {
  id: number
  작업명: string
  순번: number
  세부_작업단계?: string
  유해위험요인?: string
  유형?: string
  위험등급?: string
}

export interface JsaRecord {
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
