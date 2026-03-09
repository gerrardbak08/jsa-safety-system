import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { data: aiResult, error: aiError } = await supabase
      .from('ai_muscle_analysis')
      .insert({
        date: data.date,
        inspector: data.inspector,
        store: data.store || null,
        hq: data.hq || null,
        dept: data.dept || null,
        team: data.team || null,
        task_name: data.taskName,
        total_score: parseInt(data.totalScore, 10) || 0,
        grade: data.grade,
        full_text: data.fullText || '',
        image_url: data.imageB64 || null,
        comment: data.comment || '',
      })
      .select('id')
      .single();

    if (aiError) throw aiError;

    return NextResponse.json({ success: true, message: 'AI 분석 결과 저장 완료', id: aiResult.id });
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
