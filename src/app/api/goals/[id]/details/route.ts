import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [goalRes, milestonesRes, linksRes] = await Promise.all([
      supabase.from('goals').select('*').eq('id', id).single(),
      supabase.from('milestones').select('*').eq('goal_id', id).order('order_index', { ascending: true }),
      supabase.from('goal_task_links').select('*, todos(*)').eq('goal_id', id)
    ]);

    if (goalRes.error) throw goalRes.error;
    if (milestonesRes.error) throw milestonesRes.error;
    if (linksRes.error) throw linksRes.error;

    const data = {
      ...goalRes.data,
      milestones: milestonesRes.data || [],
      linkedTodos: (linksRes.data || [])
        .filter((link: any) => link.todos)
        .map((link: any) => link.todos)
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
