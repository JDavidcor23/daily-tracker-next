import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const TODO_SELECT = `
  id, text, description, priority, due_date, is_repetitive, frequency, active, created_at,
  tags:todo_tags(tag:tags(id, name, color)),
  instances:todo_instances(id, scheduled_date, completed)
`.trim();

function flattenTemplate(t: any) {
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
    tags: (t.tags || []).map((tt: any) => tt.tag).filter(Boolean),
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from('todo_templates')
    .select(TODO_SELECT)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const flattenedData = (data || [])
    .map(flattenTemplate)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return NextResponse.json({ success: true, data: flattenedData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      text,
      priority,
      completed,
      date,
      due_date,
      description,
      is_repetitive,
      frequency,
      tagIds,
    } = body;

    const { data: template, error: tError } = await supabase
      .from('todo_templates')
      .insert([{
        text,
        priority: priority || 'medium',
        due_date,
        description,
        is_repetitive: !!is_repetitive,
        frequency: frequency || 'daily',
        active: true,
      }])
      .select()
      .single();

    if (tError) {
      return NextResponse.json({ success: false, error: tError.message }, { status: 500 });
    }

    const scheduledDate = date || new Date().toISOString().split('T')[0];
    const isCompleted = !!completed;

    const { error: iError } = await supabase
      .from('todo_instances')
      .insert([{
        template_id: template.id,
        scheduled_date: scheduledDate,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }]);

    if (iError) {
      return NextResponse.json({ success: false, error: iError.message }, { status: 500 });
    }

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const tagLinks = tagIds.map((tagId: string) => ({
        template_id: template.id,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase.from('todo_tags').insert(tagLinks);
      if (tagError) {
        console.error('Error linking tags:', tagError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        text: template.text,
        description: template.description,
        priority: template.priority,
        due_date: template.due_date,
        is_repetitive: template.is_repetitive,
        frequency: template.frequency,
        created_at: template.created_at,
        completed: isCompleted,
        date: scheduledDate,
        tags: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
