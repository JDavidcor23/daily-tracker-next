import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, priority, completed, date, due_date, description, is_repetitive, frequency } = body;
    
    const { data, error } = await supabase
      .from('todos')
      .insert([{
        text,
        priority: priority || 'medium',
        completed: !!completed,
        date: date || new Date().toISOString().split('T')[0],
        due_date,
        description,
        is_repetitive: !!is_repetitive,
        frequency: frequency || 'daily'
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
