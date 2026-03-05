import { NextResponse } from 'next/server'
import { buildOrgHierarchy, buildFlatData } from '@/lib/org-data'

export const runtime = 'nodejs'
export const revalidate = 3600 // 1시간 캐시

// Google Sheets '목록' 시트 CSV URL
const SHEET_ID = '1d1-I93FcpGB-y4xEOLtFjNuHWeyqQC-LipLnIpC8k7A'
const SHEET_NAME = '%EB%AA%A9%EB%A1%9D' // '목록' URL encoded

function parseCSV(text: string): string[][] {
    const lines = text.trim().split('\n')
    return lines.map(line => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === '"') {
                inQuotes = !inQuotes
            } else if (ch === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += ch
            }
        }
        result.push(current.trim())
        return result
    })
}

export async function GET() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`

        const res = await fetch(url, {
            next: { revalidate: 3600 },
            headers: { 'Accept': 'text/csv' },
            signal: AbortSignal.timeout(5000), // 5초 타임아웃
        })

        if (!res.ok) throw new Error(`Google Sheets fetch failed: ${res.status}`)

        const text = await res.text()
        const rows = parseCSV(text)

        const dataRows = rows.slice(1).filter(r => r.length >= 4 && r[0] && r[3])
        if (dataRows.length < 10) throw new Error('Too few rows from Sheets')

        const hierarchy: Record<string, Record<string, Record<string, string[]>>> = {}
        const flatData: { 영업본부: string; 부서명: string; 팀명: string; 매장명: string }[] = []

        for (const row of dataRows) {
            const [영업본부, 부서명, 팀명, 매장명] = row.map(v => v.replace(/^"|"$/g, '').trim())
            if (!영업본부 || !매장명) continue
            const 부서 = 부서명 || '기타'
            const 팀 = 팀명 || '기타'
            if (!hierarchy[영업본부]) hierarchy[영업본부] = {}
            if (!hierarchy[영업본부][부서]) hierarchy[영업본부][부서] = {}
            if (!hierarchy[영업본부][부서][팀]) hierarchy[영업본부][부서][팀] = []
            if (!hierarchy[영업본부][부서][팀].includes(매장명)) {
                hierarchy[영업본부][부서][팀].push(매장명)
            }
            flatData.push({ 영업본부, 부서명: 부서, 팀명: 팀, 매장명 })
        }

        return NextResponse.json({ data: flatData, hierarchy, source: 'sheets' })
    } catch (error) {
        // Google Sheets 실패 시 정적 데이터 폴백
        console.warn('Google Sheets unavailable, using static data:', error)
        const hierarchy = buildOrgHierarchy()
        const flatData = buildFlatData()
        return NextResponse.json({ data: flatData, hierarchy, source: 'static' })
    }
}

