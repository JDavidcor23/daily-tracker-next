import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { food_meals, food_notes, date } = body;

    const entryDate = date || new Date().toISOString().split('T')[0];

    const { data: entry, error: entryError } = await supabase
      .from('daily_log_entries')
      .insert([{ date: entryDate, log_module: 'nutrition' }])
      .select()
      .single();

    if (entryError) {
      return NextResponse.json({ success: false, error: entryError.message }, { status: 500 });
    }

    const { data: moduleData, error } = await supabase
      .from('log_nutrition')
      .insert([{ entry_id: entry.id, food_meals, food_notes }])
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
        food_meals: moduleData.food_meals,
        food_notes: moduleData.food_notes,
      }],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
