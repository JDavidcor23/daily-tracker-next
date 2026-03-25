import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mood, stress_level, mind_title, mind_description, date } = body;

    const entryDate = date || new Date().toISOString().split('T')[0];

    const { data: entry, error: entryError } = await supabase
      .from('daily_log_entries')
      .insert([{ date: entryDate, log_module: 'mind' }])
      .select()
      .single();

    if (entryError) {
      return NextResponse.json({ success: false, error: entryError.message }, { status: 500 });
    }

    const { data: moduleData, error } = await supabase
      .from('log_mind')
      .insert([{ entry_id: entry.id, mood, stress_level: stress_level || 5, mind_title, mind_description }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: [{
        id: entry.id,
        date: entry.date,
        log_module: entry.log_module,
        created_at: entry.created_at,
        mood: moduleData.mood,
        stress_level: moduleData.stress_level,
        mind_title: moduleData.mind_title,
        mind_description: moduleData.mind_description,
      }],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
