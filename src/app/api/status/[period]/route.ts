import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const getDateRange = (period: string) => {
  const now = new Date();
  let startStr = '';
  const end = now.toISOString().split('T')[0];

  if (period === 'today') {
    startStr = end;
  } else if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.getTime());
    start.setDate(diff);
    startStr = start.toISOString().split('T')[0];
  } else if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    startStr = start.toISOString().split('T')[0];
  }

  return { start: startStr, end };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ period: string }> }
) {
  const { period } = await params;
  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module');

  const { start, end } = getDateRange(period);

  const { data: logs, error: logError } = await supabase
    .from('daily_logs')
    .select()
    .gte('date', start)
    .lte('date', end);

  const { data: todos, error: todoError } = await supabase
    .from('todos')
    .select()
    .gte('date', start)
    .lte('date', end);

  if (logError || todoError) {
    return NextResponse.json({ 
      success: false, 
      error: logError?.message || todoError?.message 
    }, { status: 500 });
  }

  if (logs) {
    logs.forEach((log: any) => {
      if (!log.log_module) {
        if (log.food_meals) log.log_module = 'nutrition';
        else if (log.study_topic) log.log_module = 'study';
        else if (log.mood || log.mind_notes) log.log_module = 'mind';
        else log.log_module = 'training';
      }
    });
  }

  let filteredLogs = logs || [];
  if (module) {
    filteredLogs = filteredLogs.filter((l: any) => l.log_module === module);
  }

  return NextResponse.json({ 
    success: true, 
    data: { logs: filteredLogs, todos: todos || [], period, range: { start, end } } 
  });
}
