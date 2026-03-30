import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const LOG_SELECT = `
  id, date, log_module, created_at,
  log_nutrition(food_meals, food_notes),
  log_training(trained, train_type, train_duration, train_notes),
  log_study(study_topic, study_time, study_notes),
  log_mind(mood, stress_level, mind_title, mind_description, mind_notes)
`.trim();

function flattenEntry(entry: any) {
  const nutrition = Array.isArray(entry.log_nutrition) ? entry.log_nutrition[0] : entry.log_nutrition;
  const training = Array.isArray(entry.log_training) ? entry.log_training[0] : entry.log_training;
  const study = Array.isArray(entry.log_study) ? entry.log_study[0] : entry.log_study;
  const mind = Array.isArray(entry.log_mind) ? entry.log_mind[0] : entry.log_mind;

  return {
    id: entry.id,
    date: entry.date,
    log_module: entry.log_module,
    created_at: entry.created_at,
    food_meals: nutrition?.food_meals || '',
    food_notes: nutrition?.food_notes || '',
    trained: training?.trained ?? false,
    train_type: training?.train_type || '',
    train_duration: training?.train_duration || '',
    train_notes: training?.train_notes || '',
    study_topic: study?.study_topic || '',
    study_time: study?.study_time || '',
    study_notes: study?.study_notes || '',
    mood: mind?.mood || '',
    stress_level: mind?.stress_level ?? 5,
    mind_title: mind?.mind_title || '',
    mind_description: mind?.mind_description || '',
    mind_notes: mind?.mind_notes || '',
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
