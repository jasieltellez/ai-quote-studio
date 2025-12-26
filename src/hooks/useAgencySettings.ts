import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AgencySettings {
  id: string;
  user_id: string;
  agency_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export const useAgencySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching agency settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const saveSettings = async (data: Partial<Omit<AgencySettings, 'id' | 'user_id'>>) => {
    if (!user) return null;

    try {
      if (settings) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('agency_settings')
          .update(data)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(updated);
        return updated;
      } else {
        // Insert new
        const { data: created, error } = await supabase
          .from('agency_settings')
          .insert({ ...data, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setSettings(created);
        return created;
      }
    } catch (error) {
      console.error('Error saving agency settings:', error);
      toast.error('Error al guardar la configuración');
      return null;
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agency-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo');
      return null;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    uploadLogo,
    refetch: fetchSettings,
  };
};
