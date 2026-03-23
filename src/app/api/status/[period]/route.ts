import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const getDateRange = (period: string, clientLocalStr?: string | null) => {
  const now = new Date();
  const localStr = clientLocalStr || now.toISOString().split('T')[0];

  if (period === 'today') {
    return { start: localStr, end: localStr };
  }

  if (period === 'week') {
    const d = clientLocalStr ? new Date(clientLocalStr + 'T12:00:00Z') : now;
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.getTime());
    start.setUTCDate(diff);
    const startStr = start.toISOString().split('T')[0];
    // End = start + 6 days (Sunday)
    const endDate = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    const endStr = endDate.toISOString().split('T')[0];
    return { start: startStr, end: endStr };
  }

  if (period === 'month') {
    const d = clientLocalStr ? new Date(clientLocalStr + 'T12:00:00Z') : now;
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const start = new Date(Date.UTC(year, month, 1));
    const startStr = start.toISOString().split('T')[0];
    // End = last day of the month
    const end = new Date(Date.UTC(year, month + 1, 0));
    const endStr = end.toISOString().split('T')[0];
    return { start: startStr, end: endStr };
  }

  return { start: localStr, end: localStr };
};

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period: string }> }
) {
  const { period } = await params;
  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module');
  const localDate = searchParams.get('localDate');

  const { start, end } = getDateRange(period, localDate);

  const [logsRes, todosRes] = await Promise.all([
    supabase
      .from('daily_log_entries')
      .select(LOG_SELECT)
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('todo_instances')
      .select(`
        id, scheduled_date, completed,
        template:todo_templates!inner(
          id, text, description, priority, due_date, is_repetitive, frequency, created_at
        )
      `)
      .gte('scheduled_date', start)
      .lte('scheduled_date', end),
  ]);

  if (logsRes.error || todosRes.error) {
    return NextResponse.json({
      success: false,
      error: logsRes.error?.message || todosRes.error?.message,
    }, { status: 500 });
  }

  let logs = (logsRes.data || []).map(flattenEntry);
  if (module) {
    logs = logs.filter((l) => l.log_module === module);
  }

  const todos = (todosRes.data || []).map((inst: any) => ({
    id: inst.template.id,
    text: inst.template.text,
    description: inst.template.description,
    priority: inst.template.priority,
    due_date: inst.template.due_date,
    is_repetitive: inst.template.is_repetitive,
    frequency: inst.template.frequency,
    created_at: inst.template.created_at,
    completed: inst.completed,
    date: inst.scheduled_date,
    tags: [],
  }));

  return NextResponse.json({
    success: true,
    data: { logs, todos, period, range: { start, end } },
  });
}
