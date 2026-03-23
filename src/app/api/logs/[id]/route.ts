import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const MODULE_TABLES: Record<string, string> = {
  nutrition: 'log_nutrition',
  training: 'log_training',
  study: 'log_study',
  mind: 'log_mind',
};

const LOG_SELECT = `
  id, date, log_module, created_at,
  log_nutrition(food_meals, food_notes),
  log_training(trained, train_type, train_duration, train_notes),
  log_study(study_topic, study_time, study_notes),
  log_mind(mood, stress_level, mind_notes)
`.trim();

function flattenEntry(entry: any) {
  return {
    id: entry.id,
    date: entry.date,
    log_module: entry.log_module,
    created_at: entry.created_at,
    food_meals: entry.log_nutrition?.food_meals || '',
    food_notes: entry.log_nutrition?.food_notes || '',
    trained: entry.log_training?.trained ?? false,
    train_type: entry.log_training?.train_type || '',
    train_duration: entry.log_training?.train_duration || '',
    train_notes: entry.log_training?.train_notes || '',
    study_topic: entry.log_study?.study_topic || '',
    study_time: entry.log_study?.study_time || '',
    study_notes: entry.log_study?.study_notes || '',
    mood: entry.log_mind?.mood || '',
    stress_level: entry.log_mind?.stress_level ?? 5,
    mind_notes: entry.log_mind?.mind_notes || '',
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates = { ...body };

    delete updates.id;
    delete updates.created_at;
    delete updates.log_module;

    // Fetch the entry to know which module table to update
    const { data: entry, error: fetchError } = await supabase
      .from('daily_log_entries')
      .select('log_module')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const { date, ...moduleUpdates } = updates;

    // Update date on the entry if provided
    if (date) {
      const { error: dateError } = await supabase
        .from('daily_log_entries')
        .update({ date })
        .eq('id', id);
      if (dateError) {
        return NextResponse.json({ success: false, error: dateError.message }, { status: 500 });
      }
    }

    // Update module-specific fields
    if (Object.keys(moduleUpdates).length > 0) {
      const moduleTable = MODULE_TABLES[entry.log_module];
      const { error: moduleError } = await supabase
        .from(moduleTable)
        .update(moduleUpdates)
        .eq('entry_id', id);
      if (moduleError) {
        return NextResponse.json({ success: false, error: moduleError.message }, { status: 500 });
      }
    }

    // Return full flattened entry
    const { data: updated, error: refetchError } = await supabase
      .from('daily_log_entries')
      .select(LOG_SELECT)
      .eq('id', id)
      .single();

    if (refetchError) {
      return NextResponse.json({ success: false, error: refetchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: [flattenEntry(updated)] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Deleting from daily_log_entries cascades to module tables
  const { error } = await supabase
    .from('daily_log_entries')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: null });
}
