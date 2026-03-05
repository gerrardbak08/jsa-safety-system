import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch JSA records' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabase()
        const body = await req.json()
        const { data, error } = await supabase
            .from('jsa_records')
            .insert([body])
            .select()

        if (error) throw error
        return NextResponse.json({ data: data[0] })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save JSA record' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = getSupabase()
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const 작업명 = searchParams.get('작업명')
        const 매장명 = searchParams.get('매장명')
        const created_at = searchParams.get('created_at')

        if (id) {
            // 단일 레코드 삭제
            const { error } = await supabase
                .from('jsa_records')
                .delete()
                .eq('id', id)
            if (error) throw error
        } else if (작업명 && 매장명 && created_at) {
            // 같은 JSA 그룹 전체 삭제 (동일 작업명+매장명+날짜(분 단위))
            const datePrefix = created_at.slice(0, 16) // "2026-03-05T12:30"
            const { error } = await supabase
                .from('jsa_records')
                .delete()
                .eq('작업명', 작업명)
                .eq('매장명', 매장명)
                .gte('created_at', datePrefix + ':00')
                .lte('created_at', datePrefix + ':59')
            if (error) throw error
        } else {
            return NextResponse.json({ error: 'id 또는 (작업명+매장명+created_at) 필요' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete JSA record' }, { status: 500 })
    }
}

