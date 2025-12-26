import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { toast } from 'sonner';
import { Save, Upload, Building2, Loader2 } from 'lucide-react';

export const BrandingSettings = () => {
  const { settings, loading, saveSettings, uploadLogo } = useAgencySettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    agency_name: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        agency_name: settings.agency_name || '',
        logo_url: settings.logo_url || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo no debe superar 2MB');
      return;
    }

    setIsUploading(true);
    const url = await uploadLogo(file);
    setIsUploading(false);

    if (url) {
      setFormData(prev => ({ ...prev, logo_url: url }));
      toast.success('Logo subido correctamente');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSettings(formData);
    setIsSaving(false);

    if (result) {
      toast.success('Configuración guardada correctamente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-foreground">
          Branding de la Agencia
        </h2>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo de la Agencia</Label>
          <div className="flex items-center gap-4">
            {formData.logo_url ? (
              <div className="w-20 h-20 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center bg-secondary/30">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? 'Subiendo...' : 'Subir Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG o SVG. Máximo 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Agency Name */}
        <div className="space-y-2">
          <Label htmlFor="agency_name">Nombre de la Agencia</Label>
          <Input
            id="agency_name"
            value={formData.agency_name}
            onChange={e => handleChange('agency_name', e.target.value)}
            placeholder="Mi Agencia de IA"
          />
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="contacto@miagencia.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="+52 555 123 4567"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={e => handleChange('website', e.target.value)}
            placeholder="https://miagencia.com"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={e => handleChange('address', e.target.value)}
            placeholder="Calle Principal 123, Ciudad, País"
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};
