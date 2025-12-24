import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defaultAgentFeatures, AgentFeature } from '@/types/quotation';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';

const FEATURES_STORAGE_KEY = 'ai-agency-features';

const Settings = () => {
  const [features, setFeatures] = useState<AgentFeature[]>([]);
  const [companyName, setCompanyName] = useState('AI Agency');
  const [companyEmail, setCompanyEmail] = useState('contacto@aiagency.com');

  useEffect(() => {
    const stored = localStorage.getItem(FEATURES_STORAGE_KEY);
    if (stored) {
      setFeatures(JSON.parse(stored));
    } else {
      setFeatures(defaultAgentFeatures);
    }
  }, []);

  const handleSaveFeatures = () => {
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(features));
    toast.success('Características guardadas');
  };

  const addFeature = () => {
    const newFeature: AgentFeature = {
      id: `feature-${Date.now()}`,
      name: 'Nueva Característica',
      description: '',
      baseCost: 100,
      basePrice: 250,
      isEditable: true,
    };
    setFeatures([...features, newFeature]);
  };

  const updateFeature = (id: string, field: keyof AgentFeature, value: any) => {
    setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Personaliza las características base y configuración de tu agencia
          </p>
        </div>

        {/* Company Info */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">
              Información de la Empresa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la Empresa</Label>
              <Input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="AI Agency"
              />
            </div>
            <div className="space-y-2">
              <Label>Email de Contacto</Label>
              <Input
                type="email"
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                placeholder="contacto@aiagency.com"
              />
            </div>
          </div>
        </div>

        {/* Features Configuration */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Características de Agentes
            </h2>
            <Button onClick={addFeature} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-4">
            {features.map(feature => (
              <div key={feature.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={feature.name}
                      onChange={e => updateFeature(feature.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Costo</Label>
                    <Input
                      type="number"
                      value={feature.baseCost}
                      onChange={e => updateFeature(feature.id, 'baseCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Precio</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={feature.basePrice}
                        onChange={e => updateFeature(feature.id, 'basePrice', parseFloat(e.target.value) || 0)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFeature(feature.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    value={feature.description || ''}
                    onChange={e => updateFeature(feature.id, 'description', e.target.value)}
                    rows={1}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveFeatures} className="gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
