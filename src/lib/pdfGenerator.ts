import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog, Todo, MOOD_LABELS, Mood } from './types';
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
  PDF_COL_DATE_WIDTH,
  PDF_COL_CATEGORY_WIDTH,
  PDF_COL_DETAILS_WIDTH,
  MINUTES_PER_HOUR,
} from './constants';

export interface ReportData {
  logs: DailyLog[];
  todos: Todo[];
  fitness: {
    steps?: number;
    calories?: number;
    activeMinutes?: number;
    sleepMinutes?: number;
  } | null;
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

  let y = PDF_MARGIN_VERTICAL_START;

  if (data.fitness) {
    const sleepHours = Math.floor((data.fitness.sleepMinutes || 0) / MINUTES_PER_HOUR);
    const sleepMins = (data.fitness.sleepMinutes || 0) % MINUTES_PER_HOUR;
    const sleepStr = `${sleepHours}h ${sleepMins}m`;

    autoTable(doc, {
      startY: y,
      head: [['Fitness & Health Metric', 'Value']],
      body: [
        ['Steps', data.fitness.steps?.toLocaleString() || '0'],
        ['Calories Burned', (data.fitness.calories?.toLocaleString() || '0') + ' kcal'],
        ['Active Minutes', (data.fitness.activeMinutes || 0) + ' min'],
        ['Sleep', sleepStr],
      ],
      theme: 'grid',
      headStyles: { fillColor: '#6366f1', textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: PDF_FONT_SIZE_TABLE_MAIN, cellPadding: 8 },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + PDF_SECTION_GAP;
  }

  if (data.todos.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Task', 'Priority', 'Status']],
      body: data.todos.map(t => [
        t.text,
        t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
        t.completed ? 'Done' : 'Pending',
      ]),
      theme: 'grid',
      headStyles: { fillColor: '#10b981', textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 6, overflow: 'linebreak' },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + PDF_SECTION_GAP;
  } else {
    doc.setFontSize(PDF_FONT_SIZE_TABLE_MAIN);
    doc.setTextColor('#94a3b8');
    doc.text('No tasks recorded for this period.', PDF_MARGIN_HORIZONTAL, y);
    y += PDF_SECTION_GAP;
  }

  if (data.logs.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Category', 'Details', 'Notes']],
      body: data.logs.map(log => {
        let details = '';
        let notes = '';
        if (log.log_module === 'nutrition') {
          details = log.food_meals || '';
          notes = log.food_notes || '';
        }
        if (log.log_module === 'training') {
          details = log.trained ? `${log.train_type} (${log.train_duration}m)` : 'Rest Day';
          notes = log.train_notes || '';
        }
        if (log.log_module === 'study') {
          details = `${log.study_topic} (${log.study_time}m)`;
          notes = log.study_notes || '';
        }
        if (log.log_module === 'mind') {
          const moodText = log.mood ? MOOD_LABELS[log.mood as Mood] || 'Unknown' : 'Unknown';
          details = `Mood: ${moodText} | Stress: ${log.stress_level}/10`;
          notes = log.mind_notes || '';
        }
        return [
          new Date(log.date + 'T12:00:00').toLocaleDateString(),
          log.log_module.charAt(0).toUpperCase() + log.log_module.slice(1),
          details,
          notes,
        ];
      }),
      theme: 'striped',
      headStyles: { fillColor: '#f59e0b', textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: PDF_FONT_SIZE_TABLE_DETAIL, cellPadding: 6, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: PDF_COL_DATE_WIDTH },
        1: { cellWidth: PDF_COL_CATEGORY_WIDTH },
        2: { cellWidth: PDF_COL_DETAILS_WIDTH },
        3: { cellWidth: 'auto' },
      },
      margin: { left: PDF_MARGIN_HORIZONTAL, right: PDF_MARGIN_HORIZONTAL },
    });
  } else {
    doc.setFontSize(PDF_FONT_SIZE_SUBTITLE);
    doc.setTextColor('#94a3b8');
    doc.text('No activity logs recorded for this period.', PDF_MARGIN_HORIZONTAL, y);
  }

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
