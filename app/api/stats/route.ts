import { NextResponse } from 'next/server'
import type { AccidentRecord, AccidentStatsResponse } from '@/app/stats/types'

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/16NDLYMQRMTWNYaYCy_8NNzXPowkSs_m3uJitQVlbU_8/gviz/tq?tqx=out:csv&sheet=%EC%82%AC%EA%B3%A0%EC%A1%B0%EC%82%AC'

// 추출 대상 컬럼 인덱스 (사고조사 시트 기준):
// A(0): 년
// B(1): 월
// E(4): 부서
// F(5): 팀명
// H(7): 나이대
// J(9): 재해일자
// O(14): 재해 유형
const COL_INDICES = [0, 1, 4, 5, 9, 14, 7] as const
const COL_KEYS: (keyof AccidentRecord)[] = [
  'year', 'month', 'department', 'team', 'accidentDate', 'accidentType', 'ageGroup'
]

function parseCSV(raw: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuote = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const next = raw[i + 1]

    if (ch === '"') {
      if (inQuote && next === '"') {
        cell += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === ',' && !inQuote) {
      row.push(cell.trim())
      cell = ''
    } else if (ch === '\n' && !inQuote) {
      row.push(cell.trim())
      if (row.some((c) => c !== '')) rows.push(row)
      row = []
      cell = ''
    } else if (ch === '\r') {
      // ignore
    } else {
      cell += ch
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim())
    if (row.some((c) => c !== '')) rows.push(row)
  }

  return rows
}

export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const buffer = await res.arrayBuffer()
    let text = ''
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    } catch {
      text = new TextDecoder('euc-kr').decode(buffer)
    }
    const rows = parseCSV(text)

    if (rows.length < 2) {
      throw new Error('시트 데이터가 비어 있습니다')
    }
    
    const data: AccidentRecord[] = rows.slice(1).map((row) => {
      const record = {} as AccidentRecord
      COL_INDICES.forEach((colIdx, i) => {
        let val = row[colIdx] ?? ''
        // Some cells might be empty string. We'll leave them as is.
        record[COL_KEYS[i]] = val
      })
      return record
    })

    return NextResponse.json({ data } satisfies AccidentStatsResponse)
  } catch (error) {
    console.error('stats API error:', error)

    const fallbackBody: AccidentStatsResponse = {
      data: [],
      error: 'Google Sheets 접근 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    }
    return NextResponse.json(fallbackBody)
  }
}
