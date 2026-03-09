import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Insert Inspection Main Info
    const { data: inspection, error: inspectionError } = await supabase
      .from('safety_inspections')
      .insert({
        date: data.date,
        inspector: data.inspector,
        hq: data.hq,
        dept: data.dept,
        team: data.team,
        store: data.store
      })
      .select('id')
      .single();

    if (inspectionError) throw inspectionError;

    // 2. Insert Inspection Items using the generated ID
    if (data.items && data.items.length > 0) {
      const itemsToInsert = data.items.map((item: any) => ({
        inspection_id: inspection.id,
        category: item.cat,
        question: item.question,
        score: parseInt(item.score, 10) || 0,
        judgment: item.judgment,
        remark: item.remark,
        photo_url: item.photoUrl || null
      }));

      const { error: itemsError } = await supabase
        .from('safety_inspection_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ success: true, message: '저장 성공', id: inspection.id });
  } catch (error: any) {
    console.error('Error in /api/safety:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
