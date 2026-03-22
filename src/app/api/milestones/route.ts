import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('milestones')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
