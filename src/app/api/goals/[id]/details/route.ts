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
      supabase
        .from('goal_task_links')
        .select(`
          *,
          todo_templates(
            id, text, description, priority, due_date, is_repetitive, frequency, active, created_at,
            instances:todo_instances(id, scheduled_date, completed)
          )
        `)
        .eq('goal_id', id),
    ]);

    if (goalRes.error) throw goalRes.error;
    if (milestonesRes.error) throw milestonesRes.error;
    if (linksRes.error) throw linksRes.error;

    const linkedTodos = (linksRes.data || [])
      .filter((link: any) => link.todo_templates)
      .map((link: any) => {
        const t = link.todo_templates;
        const instances = [...(t.instances || [])].sort(
          (a: any, b: any) => b.scheduled_date.localeCompare(a.scheduled_date)
        );
        const inst = instances[0];
        return {
          id: t.id,
          text: t.text,
          description: t.description,
          priority: t.priority,
          due_date: t.due_date,
          is_repetitive: t.is_repetitive,
          frequency: t.frequency,
          created_at: t.created_at,
          completed: inst?.completed ?? false,
          date: inst?.scheduled_date || new Date().toISOString().split('T')[0],
          tags: [],
        };
      });

    const data = {
      ...goalRes.data,
      milestones: milestonesRes.data || [],
      linkedTodos,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
