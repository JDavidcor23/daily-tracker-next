'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { saveCredentials, getCredentials, resetSupabaseClient } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useSupabaseContext } from '@/context/SupabaseContext';
import { COPY_FEEDBACK_DURATION_MS } from '@/lib/constants';

export function useSettings() {
  const { refreshClient } = useSupabaseContext();
  const creds = getCredentials();

  const [url, setUrl] = useState(creds.url);
  const [anonKey, setAnonKey] = useState(creds.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copied2, setCopied2] = useState(false);
  const [copied3, setCopied3] = useState(false);
  const [gfitConnected, setGfitConnected] = useState<boolean | null>(null);
  const [gfitLoading, setGfitLoading] = useState(false);

  const checkGoogleFit = useCallback(async () => {
    try {
      const fitStatus = await api.googleFit.getStatus();
      setGfitConnected(fitStatus.connected);
    } catch {
      setGfitConnected(false);
    }
  }, []);

  useEffect(() => {
    checkGoogleFit();
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_fit') === 'connected') {
      toast.success('Google Fit connected successfully!');
      setGfitConnected(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkGoogleFit]);

  const handleConnectGoogleFit = async () => {
    setGfitLoading(true);
    try {
      const { url: authUrl } = await api.googleFit.getAuthUrl();
      window.location.href = authUrl;
    } catch (err: any) {
      toast.error(`Failed to get auth URL: ${err.message}`);
      setGfitLoading(false);
    }
  };

  const handleDisconnectGoogleFit = async () => {
    try {
      await api.googleFit.disconnect();
      setGfitConnected(false);
      toast.success('Google Fit disconnected.');
    } catch (err: any) {
      toast.error(`Disconnect failed: ${err.message}`);
    }
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      toast.error('Both URL and anon key are required.');
      return;
    }
    saveCredentials(url.trim(), anonKey.trim());
    resetSupabaseClient();
    refreshClient();
    toast.success('Credentials saved & connection tested!');
  };

  const handleCopySQL = (schema: string, mode: 1 | 2 | 3 = 1) => {
    navigator.clipboard.writeText(schema).then(() => {
      if (mode === 1) {
        setCopied(true);
        setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
      } else if (mode === 2) {
        setCopied2(true);
        setTimeout(() => setCopied2(false), COPY_FEEDBACK_DURATION_MS);
      } else if (mode === 3) {
        setCopied3(true);
        setTimeout(() => setCopied3(false), COPY_FEEDBACK_DURATION_MS);
      }
    });
  };

  return {
    url, setUrl,
    anonKey, setAnonKey,
    showKey, setShowKey,
    copied,
    copied2,
    copied3,
    gfitConnected,
    gfitLoading,
    handleConnectGoogleFit,
    handleDisconnectGoogleFit,
    handleSave,
    handleCopySQL,
  };
}
