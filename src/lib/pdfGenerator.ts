import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog, Todo, MOOD_LABELS, Mood, LogModule } from './types';
import {
  PDF_FONT_SIZE_TITLE,
  PDF_FONT_SIZE_SUBTITLE,
  PDF_FONT_SIZE_TABLE_MAIN,
  PDF_FONT_SIZE_TABLE_DETAIL,
  PDF_FONT_SIZE_FOOTER,
  PDF_MARGIN_HORIZONTAL,
  PDF_MARGIN_VERTICAL_START,
  PDF_TITLE_Y,
  PDF_SUBTITLE_Y,
  PDF_SEPARATOR_Y,
  PDF_SEPARATOR_END_X,
  PDF_SECTION_GAP,
  PDF_FOOTER_MARGIN_BOTTOM,
  PDF_SUBSECTION_GAP,
  PDF_LEGEND_Y,
  MINUTES_PER_HOUR,
  LIFE_AREA_LABELS,
  GOAL_STATUS_LABELS,
  PDF_COLOR_SECTION_NUTRITION,
  PDF_COLOR_SECTION_TRAINING,
  PDF_COLOR_SECTION_STUDY,
  PDF_COLOR_SECTION_MIND,
  PDF_COLOR_SECTION_GOALS,
  PDF_COLOR_SECTION_MILESTONES,
} from './constants';

interface MilestoneReport {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  order_index?: number;
}

interface GoalReportItem {
  id: string;
  title: string;
  life_area: string;
  description?: string;
  due_date: string;
  status: string;
  progress: number;
  milestones: MilestoneReport[];
}

export interface ReportData {
  logs: DailyLog[];
  todos: Todo[];
  fitness: {
    steps?: number;
    calories?: number;
    activeMinutes?: number;
    sleepMinutes?: number;
  } | null;
  goals: GoalReportItem[];
}

const MODULE_CONFIG: Array<{
  key: LogModule;
  label: string;
  color: string;
}> = [
  { key: 'nutrition', label: 'Nutrition',      color: PDF_COLOR_SECTION_NUTRITION },
  { key: 'training',  label: 'Training',        color: PDF_COLOR_SECTION_TRAINING  },
  { key: 'study',     label: 'Study',           color: PDF_COLOR_SECTION_STUDY     },
  { key: 'mind',      label: 'Mental Health',   color: PDF_COLOR_SECTION_MIND      },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString();
}

function drawSectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(PDF_FONT_SIZE_SUBTITLE);
  doc.setTextColor('#1e293b');
  doc.text(text, PDF_MARGIN_HORIZONTAL, y + 10);
  return y + 20;
}

function drawSubsectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(PDF_FONT_SIZE_TABLE_MAIN);
  doc.setTextColor('#475569');
  doc.text(text, PDF_MARGIN_HORIZONTAL, y + 10);
  return y + 18;
}

export function generatePDFReport(period: string, data: ReportData) {
  const doc = new jsPDF('p', 'pt', 'a4');
  const d = new Date();
  const dateStr = d.toLocaleDateString();

  doc.setFontSize(PDF_FONT_SIZE_TITLE);
  doc.setTextColor('#1e293b');
  doc.text('Daily Tracker Report', PDF_MARGIN_HORIZONTAL, PDF_TITLE_Y);

  doc.setFontSize(PDF_FONT_SIZE_SUBTITLE);
  doc.setTextColor('#64748b');
  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month';
  doc.text(`Period: ${periodLabel}  |  Generated on: ${dateStr}`, PDF_MARGIN_HORIZONTAL, PDF_SUBTITLE_Y);

  doc.setDrawColor(226, 232, 240);
  doc.line(PDF_MARGIN_HORIZONTAL, PDF_SEPARATOR_Y, PDF_SEPARATOR_END_X, PDF_SEPARATOR_Y);

  doc.setFontSize(PDF_FONT_SIZE_FOOTER);
  doc.setTextColor('#94a3b8');
  doc.text(
    'Status symbols:  ✔ = Completed   |   X = Not done   |   - = Pending',
    PDF_MARGIN_HORIZONTAL,
    PDF_LEGEND_Y,
  );

  let y = PDF_MARGIN_VERTICAL_START;

  // ── Fitness & Health ─────────────────────────────────────────────────────
  if (data.fitness) {
    const sleepHours = Math.floor((data.fitness.sleepMinutes || 0) / MINUTES_PER_HOUR);
    const sleepMins  = (data.fitness.sleepMinutes || 0) % MINUTES_PER_HOUR;

    y = drawSectionTitle(doc, 'Fitness & Health Overview', y);

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Steps',          data.fitness.steps?.toLocaleString() || '0'],
        ['Calories Burned',(data.fitness.calories?.toLocaleString() || '0') + ' kcal'],
        ['Active Minutes', (data.fitness.activeMinutes || 0) + ' min'],
        ['Sleep',          `${sleepHours}h ${sleepMins}m`],
      ],
      theme: 'grid',
      headStyles: { fillColor: PDF_COLOR_SECTION_GOALS, textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: PDF_FONT_SIZE_TABLE_MAIN, cellPadding: 8 },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + PDF_SECTION_GAP;
  }

  // ── Tasks & Progress ─────────────────────────────────────────────────────
  if (data.todos.length > 0) {
    const todosByDate: Record<string, Todo[]> = {};
    [...data.todos]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(t => {
        if (!todosByDate[t.date]) todosByDate[t.date] = [];
        todosByDate[t.date].push(t);
      });

    const dates = Object.keys(todosByDate).sort();

    y = drawSectionTitle(doc, 'Tasks & Progress', y);

    dates.forEach((dateString, idx) => {
      if (dates.length > 1) {
        y = drawSubsectionTitle(doc, new Date(dateString + 'T12:00:00').toLocaleDateString(), y);
      }

      autoTable(doc, {
        startY: y,
        head: [['Task', 'Description', 'Freq.', 'Priority', 'Status']],
        body: todosByDate[dateString].map(t => [
          t.text,
          t.description || '-',
          t.is_repetitive ? (t.frequency ? t.frequency.charAt(0).toUpperCase() + t.frequency.slice(1) : 'Daily') : 'Once',
          t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          t.completed ? '✔' : 'X',
        ]),
        theme: 'grid',
        headStyles: { fillColor: '#10b981', textColor: '#ffffff', fontStyle: 'bold' },
        styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 6, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50 },
          3: { cellWidth: 60 },
          4: { cellWidth: 50 },
        },
        alternateRowStyles: { fillColor: '#f8fafc' },
        margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
      });
      // @ts-ignore
      y = doc.lastAutoTable.finalY + (idx === dates.length - 1 ? PDF_SECTION_GAP : 10);
    });
  } else {
    doc.setFontSize(PDF_FONT_SIZE_TABLE_MAIN);
    doc.setTextColor('#94a3b8');
    doc.text('No tasks recorded for this period.', PDF_MARGIN_HORIZONTAL, y);
    y += PDF_SECTION_GAP;
  }

  // ── Activity Logs — separated by module ──────────────────────────────────
  if (data.logs.length > 0) {
    y = drawSectionTitle(doc, 'Activity Logs & Daily Details', y);

    for (const mod of MODULE_CONFIG) {
      const moduleLogs = data.logs
        .filter(log => log.log_module === mod.key)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (moduleLogs.length === 0) continue;

      y = drawSubsectionTitle(doc, mod.label, y);

      let head: string[][];
      let body: string[][];

      if (mod.key === 'nutrition') {
        head = [['Date', 'Meals', 'Notes']];
        body = moduleLogs.map(log => [
          formatDate(log.date),
          log.food_meals || '-',
          log.food_notes || '-',
        ]);
      } else if (mod.key === 'training') {
        head = [['Date', 'Trained', 'Type', 'Duration', 'Notes']];
        body = moduleLogs.map(log => [
          formatDate(log.date),
          log.trained ? '✔' : 'X',
          log.train_type || '-',
          log.train_duration ? `${log.train_duration} min` : '-',
          log.train_notes || '-',
        ]);
      } else if (mod.key === 'study') {
        head = [['Date', 'Topic', 'Duration', 'Notes']];
        body = moduleLogs.map(log => [
          formatDate(log.date),
          log.study_topic || '-',
          log.study_time ? `${log.study_time} min` : '-',
          log.study_notes || '-',
        ]);
      } else {
        head = [['Date', 'Mood', 'Stress', 'Notes']];
        body = moduleLogs.map(log => [
          formatDate(log.date),
          log.mood ? (MOOD_LABELS[log.mood as Mood] || 'Unknown') : '-',
          log.stress_level != null ? `${log.stress_level}/10` : '-',
          log.mind_notes || '-',
        ]);
      }

      autoTable(doc, {
        startY: y,
        head,
        body,
        theme: 'grid',
        headStyles: { fillColor: mod.color, textColor: '#ffffff', fontStyle: 'bold' },
        styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 6, overflow: 'linebreak' },
        alternateRowStyles: { fillColor: '#f8fafc' },
        margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
      });
      // @ts-ignore
      y = doc.lastAutoTable.finalY + PDF_SUBSECTION_GAP;
    }

    y += PDF_SECTION_GAP - PDF_SUBSECTION_GAP;
  } else {
    doc.setFontSize(PDF_FONT_SIZE_SUBTITLE);
    doc.setTextColor('#94a3b8');
    doc.text('No activity logs recorded for this period.', PDF_MARGIN_HORIZONTAL, y);
    y += PDF_SECTION_GAP;
  }

  // ── Goals & Progress ─────────────────────────────────────────────────────
  if (data.goals.length > 0) {
    y = drawSectionTitle(doc, 'Goals & Progress', y);

    autoTable(doc, {
      startY: y,
      head: [['Goal', 'Life Area', 'Status', 'Progress', 'Due Date']],
      body: data.goals.map(goal => [
        goal.title,
        LIFE_AREA_LABELS[goal.life_area] || goal.life_area,
        GOAL_STATUS_LABELS[goal.status] || goal.status,
        `${goal.progress}%`,
        formatDate(goal.due_date),
      ]),
      theme: 'grid',
      headStyles: { fillColor: PDF_COLOR_SECTION_GOALS, textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 6, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 80 },
        2: { cellWidth: 70 },
        3: { cellWidth: 60 },
        4: { cellWidth: 70 },
      },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + PDF_SUBSECTION_GAP;

    // Milestones per goal
    for (const goal of data.goals) {
      if (goal.milestones.length === 0) continue;

      const sorted = [...goal.milestones].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
      );
      const completedCount = sorted.filter(m => m.completed).length;

      y = drawSubsectionTitle(
        doc,
        `${goal.title} — Milestones (${completedCount}/${sorted.length} completed)`,
        y,
      );

      autoTable(doc, {
        startY: y,
        head: [['Milestone', 'Due Date', 'Status']],
        body: sorted.map(m => [
          m.title,
          m.due_date ? formatDate(m.due_date) : '-',
          m.completed ? '✔' : '-',
        ]),
        theme: 'striped',
        headStyles: { fillColor: PDF_COLOR_SECTION_MILESTONES, textColor: '#ffffff', fontStyle: 'bold' },
        styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 5, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 80 },
          2: { cellWidth: 70 },
        },
        alternateRowStyles: { fillColor: '#f8fafc' },
        margin: { left: PDF_MARGIN_HORIZONTAL + PDF_SUBSECTION_GAP, right: PDF_MARGIN_HORIZONTAL },
      });
      // @ts-ignore
      y = doc.lastAutoTable.finalY + PDF_SUBSECTION_GAP;
    }
  } else {
    doc.setFontSize(PDF_FONT_SIZE_TABLE_MAIN);
    doc.setTextColor('#94a3b8');
    doc.text('No goals recorded.', PDF_MARGIN_HORIZONTAL, y);
  }

  // ── Page numbers ─────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(PDF_FONT_SIZE_FOOTER);
    doc.setTextColor('#94a3b8');
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - PDF_FOOTER_MARGIN_BOTTOM,
      { align: 'center' },
    );
  }

  doc.save(`Activity_Report_${period}_${d.getTime()}.pdf`);
}
