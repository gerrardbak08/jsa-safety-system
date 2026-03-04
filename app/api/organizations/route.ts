import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('영업본부', { ascending: true })

        if (error) throw error

        // Build hierarchical structure
        const hierarchy: Record<string, Record<string, Record<string, string[]>>> = {}
        for (const row of data || []) {
            if (!hierarchy[row.영업본부]) hierarchy[row.영업본부] = {}
            if (!hierarchy[row.영업본부][row.부서명]) hierarchy[row.영업본부][row.부서명] = {}
            if (!hierarchy[row.영업본부][row.부서명][row.팀명]) {
                hierarchy[row.영업본부][row.부서명][row.팀명] = []
            }
            hierarchy[row.영업본부][row.부서명][row.팀명].push(row.매장명)
        }

        return NextResponse.json({ data, hierarchy })
    } catch (error) {
        console.error('Organizations fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { data, error } = await supabase
            .from('organizations')
            .insert([body])
            .select()

        if (error) throw error
        return NextResponse.json({ data: data[0] })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to insert organization' }, { status: 500 })
    }
}
