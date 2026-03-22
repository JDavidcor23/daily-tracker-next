'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generatePDFReport, ReportData } from '@/lib/pdfGenerator';
import { DailyLog, Todo } from '@/lib/types';

export function useDownloadReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (period: 'today' | 'week' | 'month') => {
    setIsOpen(false);
    setLoading(true);

    const loadingToast = toast.loading(`Generating ${period} report...`);

    try {
      // Calling our unified API routes
      const statusRes = await fetch(`/api/status/${period}`);
      const statusData = await statusRes.json();

      if (!statusData.success) {
        throw new Error(statusData.error || 'Failed to fetch tracking data');
      }

      const logs: DailyLog[] = statusData.data.logs || [];
      const todos: Todo[] = statusData.data.todos || [];

      let fitnessData = null;
      try {
        const fitRes = await fetch(`/api/google-fit/data?period=${period}`);
        const fitJson = await fitRes.json();
        if (fitJson.success && fitJson.data) {
          fitnessData = fitJson.data;
        }
      } catch (err) {
        console.warn('Google Fit fetch failed (ignored for report):', err);
      }

      const reportData: ReportData = { logs, todos, fitness: fitnessData };
      generatePDFReport(period, reportData);

      toast.success('Report downloaded!', { id: loadingToast });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate report', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return { isOpen, setIsOpen, loading, dropdownRef, handleDownload };
}
