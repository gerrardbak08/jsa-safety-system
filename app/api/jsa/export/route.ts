import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export async function GET() {
    try {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('jsa_records')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        // ─── 엑셀 컬럼 구성 ───────────────────────────────────────────
        // 설계 원칙:
        //  1) 작업 기본 정보 (누가, 어디서, 언제)
        //  2) 조직 정보 (영업본부 ~ 매장)
        //  3) 단계별 위험성 평가 내용
        //  4) AI 분석 결과
        //  5) 사진 URL (링크로 클릭 가능)
        const rows = (data || []).map((r: any) => ({
            // ① 기본 정보
            '작성일시': r.created_at
                ? new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
                : '',
            '작업일시': r.작업일시 || '',
            '작성자': r.작성자 || '',
            '관리감독자': r.관리감독자 || '',
            '참여근로자': r.참여근로자 || '',

            // ② 조직 정보
            '영업본부': r.영업본부 || '',
            '부서명': r.부서명 || '',
            '팀명': r.팀명 || '',
            '매장명': r.매장명 || '',

            // ③ 작업 정보
            '작업명': r.작업명 || '',
            '단계번호': r.단계번호 ?? '',
            '세부작업내용(단계)': r.작업내용 || '',

            // ④ 위험성 평가
            '유해위험요인': r.유해위험요인 || '',
            '위험등급': r.위험등급 || '',
            '위험유형': r.유형 || '',
            '개선대책/안전조치': r.개선대책 || '',

            // ⑤ AI 분석
            'AI분석결과': r.ai_분석결과 || '',

            // ⑥ 사진
            '사진URL': r.사진_url || '',
        }))

        // 워크북 생성
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(rows)

        // 컬럼 너비 설정
        ws['!cols'] = [
            { wch: 20 }, // 작성일시
            { wch: 20 }, // 작업일시
            { wch: 12 }, // 작성자
            { wch: 12 }, // 관리감독자
            { wch: 20 }, // 참여근로자
            { wch: 14 }, // 영업본부
            { wch: 16 }, // 부서명
            { wch: 10 }, // 팀명
            { wch: 12 }, // 매장명
            { wch: 16 }, // 작업명
            { wch: 8 }, // 단계번호
            { wch: 30 }, // 세부작업내용
            { wch: 30 }, // 유해위험요인
            { wch: 8 }, // 위험등급
            { wch: 12 }, // 위험유형
            { wch: 35 }, // 개선대책
            { wch: 40 }, // AI분석결과
            { wch: 50 }, // 사진URL
        ]

        XLSX.utils.book_append_sheet(wb, ws, 'JSA위험성평가')

        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
        const today = new Date().toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).replace(/\. /g, '-').replace('.', '')

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename*=UTF-8''JSA%EC%9C%84%ED%97%98%EC%84%B1%ED%8F%89%EA%B0%80_${today}.xlsx`,
            },
        })
    } catch (error) {
        return NextResponse.json({ error: 'Excel export failed' }, { status: 500 })
    }
}
