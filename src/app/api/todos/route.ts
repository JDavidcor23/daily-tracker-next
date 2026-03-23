import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*, tags:todo_tags(tag:tags(*))')
    .order('completed', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Post-process the join data to flatten tags
  const flattenedData = data?.map((todo: any) => ({
    ...todo,
    tags: todo.tags ? todo.tags.map((t: any) => t.tag) : []
  }));

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
      tagIds 
    } = body;
    
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
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Handle tags if tagIds are provided
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const tagLinks = tagIds.map((tagId: string) => ({
        todo_id: data.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('todo_tags')
        .insert(tagLinks);
        
      if (tagError) {
        console.error('Error linking tags:', tagError);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
