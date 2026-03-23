import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tagIds, ...updates } = body;
    
    // Remove fields that should not be updated
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Handle tags update if tagIds are provided
    if (tagIds && Array.isArray(tagIds)) {
      // 1. Delete existing links
      await supabase.from('todo_tags').delete().eq('todo_id', id);
      
      // 2. Insert new links
      if (tagIds.length > 0) {
        const tagLinks = tagIds.map((tagId: string) => ({
          todo_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('todo_tags')
          .insert(tagLinks);
          
        if (tagError) {
          console.error('Error updating tags:', tagError);
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('todos')
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
