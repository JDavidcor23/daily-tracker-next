import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase.from('daily_logs').select('*').order('created_at', { ascending: false });
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (data) {
    data.forEach((log: any) => {
      if (!log.log_module) {
        if (log.food_meals) log.log_module = 'nutrition';
        else if (log.study_topic) log.log_module = 'study';
        else if (log.mood || log.mind_notes) log.log_module = 'mind';
        else log.log_module = 'training';
      }
    });
  }

  return NextResponse.json({ success: true, data });
}
