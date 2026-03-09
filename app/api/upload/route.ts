import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const runtime = 'edge'; // Optional: if deployment supports edge. Otherwise remove.

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general'; // default folder

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase
      .storage
      .from('safety-images') // Assumes bucket is named 'safety-images'
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (error) {
       console.error("Supabase storage upload error:", error);
       throw error;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('safety-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
