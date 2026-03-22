import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trained, train_type, train_duration, train_notes, date } = body;
    
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([{
        trained: trained !== undefined ? trained : true,
        train_type,
        train_duration,
        train_notes,
        date: date || new Date().toISOString().split('T')[0]
      }])
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
