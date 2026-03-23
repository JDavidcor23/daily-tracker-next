import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const getDateRange = (period: string, clientLocalStr?: string | null) => {
  const now = new Date();
  let end = clientLocalStr || now.toISOString().split('T')[0];
  let startStr = '';

  if (period === 'today') {
    startStr = end;
  } else if (period === 'week') {
    const d = clientLocalStr ? new Date(clientLocalStr + 'T12:00:00Z') : now;
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.getTime());
    start.setUTCDate(diff);
    startStr = start.toISOString().split('T')[0];
  } else if (period === 'month') {
    const d = clientLocalStr ? new Date(clientLocalStr + 'T12:00:00Z') : now;
    const start = new Date(d.getUTCFullYear(), d.getUTCMonth(), 1);
    startStr = start.toISOString().split('T')[0];
  }

  return { start: startStr, end };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ period: string }> }
) {
  const { period } = await params;
  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module');
  const localDate = searchParams.get('localDate');

  const { start, end } = getDateRange(period, localDate);

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
