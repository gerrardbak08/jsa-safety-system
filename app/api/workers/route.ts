import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// GET: 작성자 목록 조회
export async function GET() {
    try {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('이름', { ascending: true })

        // workers 테이블이 없거나 비어있으면 기본값 반환
        if (error || !data || data.length === 0) {
            return NextResponse.json({
                data: [],
                fallback: true,
                message: 'workers 테이블이 없거나 비어있어 기본값을 사용합니다.',
            })
        }

        return NextResponse.json({ data })
    } catch {
        return NextResponse.json({ data: [], fallback: true })
    }
}

// POST: 작성자 추가
export async function POST(req: Request) {
    try {
        const supabase = getSupabase()
        const body = await req.json()
        const { data, error } = await supabase
            .from('workers')
            .insert([{ 이름: body.이름, 직책: body.직책 || null }])
            .select()

        if (error) throw error
        return NextResponse.json({ data: data[0] })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add worker' }, { status: 500 })
    }
}

// DELETE: 작성자 삭제
export async function DELETE(req: Request) {
    try {
        const supabase = getSupabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })

        const { error } = await supabase.from('workers').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete worker' }, { status: 500 })
    }
}
