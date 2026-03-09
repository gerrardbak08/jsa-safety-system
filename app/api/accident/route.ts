import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { data: accident, error: accidentError } = await supabase
      .from('accident_investigations')
      .insert({
        check_date: data.checkDate,
        inspector: data.inspector,
        store: data.store,
        hq: data.hq || null,
        dept: data.dept || null,
        team: data.team || null,
        accident_date: data.accidentDate,
        accident_type: data.accidentType,
        accident_content: data.accidentContent,
        agency: data.agency,
        agency_photo: data.imgAgency || null,
        hazard: data.hazard,
        risk_grade: data.risk,
        status: data.status,
        action_photo: data.imgAction || null,
        comment: data.comment,
      })
      .select('id')
      .single();

    if (accidentError) throw accidentError;

    return NextResponse.json({ success: true, message: '사고 조사 결과 저장 성공', id: accident.id });
  } catch (error: any) {
    console.error('Error in /api/accident:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
