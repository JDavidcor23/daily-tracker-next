import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const INSTANCE_FIELDS = new Set(['completed', 'completed_at', 'date', 'scheduled_date']);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tagIds, ...allUpdates } = body;

    delete allUpdates.id;
    delete allUpdates.created_at;

    const templateUpdates: Record<string, any> = {};
    const instanceUpdates: Record<string, any> = {};

    for (const [key, val] of Object.entries(allUpdates)) {
      if (INSTANCE_FIELDS.has(key)) {
        if (key === 'date') {
          instanceUpdates['scheduled_date'] = val;
        } else {
          instanceUpdates[key] = val;
        }
      } else {
        templateUpdates[key] = val;
      }
    }

    if (Object.keys(templateUpdates).length > 0) {
      const { error } = await supabase
        .from('todo_templates')
        .update(templateUpdates)
        .eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    if (Object.keys(instanceUpdates).length > 0) {
      const { data: instances } = await supabase
        .from('todo_instances')
        .select('id')
        .eq('template_id', id)
        .order('scheduled_date', { ascending: false })
        .limit(1);

      if (instances?.[0]) {
        const { error } = await supabase
          .from('todo_instances')
          .update(instanceUpdates)
          .eq('id', instances[0].id);
        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
      }
    }

    if (tagIds && Array.isArray(tagIds)) {
      await supabase.from('todo_tags').delete().eq('template_id', id);
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map((tagId: string) => ({ template_id: id, tag_id: tagId }));
        const { error: tagError } = await supabase.from('todo_tags').insert(tagLinks);
        if (tagError) {
          console.error('Error updating tags:', tagError);
        }
      }
    }

    const { data: updated, error: refetchError } = await supabase
      .from('todo_templates')
      .select(TODO_SELECT)
      .eq('id', id)
      .single();

    if (refetchError) {
      return NextResponse.json({ success: false, error: refetchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: flattenTemplate(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Deleting from todo_templates cascades to todo_instances and todo_tags
    const { error } = await supabase
      .from('todo_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
