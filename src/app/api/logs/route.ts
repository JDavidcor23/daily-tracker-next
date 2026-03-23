import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const LOG_SELECT = `
  id, date, log_module, created_at,
  log_nutrition(food_meals, food_notes),
  log_training(trained, train_type, train_duration, train_notes),
  log_study(study_topic, study_time, study_notes),
  log_mind(mood, stress_level, mind_notes)
`.trim();

function flattenEntry(entry: any) {
  return {
    id: entry.id,
    date: entry.date,
    log_module: entry.log_module,
    created_at: entry.created_at,
    food_meals: entry.log_nutrition?.food_meals || '',
    food_notes: entry.log_nutrition?.food_notes || '',
    trained: entry.log_training?.trained ?? false,
    train_type: entry.log_training?.train_type || '',
    train_duration: entry.log_training?.train_duration || '',
    train_notes: entry.log_training?.train_notes || '',
    study_topic: entry.log_study?.study_topic || '',
    study_time: entry.log_study?.study_time || '',
    study_notes: entry.log_study?.study_notes || '',
    mood: entry.log_mind?.mood || '',
    stress_level: entry.log_mind?.stress_level ?? 5,
    mind_notes: entry.log_mind?.mind_notes || '',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase
    .from('daily_log_entries')
    .select(LOG_SELECT)
    .order('created_at', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(flattenEntry) });
}
