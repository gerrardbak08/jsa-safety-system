import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
    try {
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
