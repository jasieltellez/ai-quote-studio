import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseQuotations } from '@/hooks/useSupabaseQuotations';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Settings as SettingsIcon, Loader2 } from 'lucide-react';

const Settings = () => {
  const { features, saveFeature, deleteFeature, loading } = useSupabaseQuotations();
  const [isSaving, setIsSaving] = useState(false);
  const [editingFeatures, setEditingFeatures] = useState<{
    id?: string;
    name: string;
    description: string;
    baseCost: number;
    basePrice: number;
  }[]>([]);

  const handleAddFeature = () => {
    setEditingFeatures([
      ...editingFeatures,
      { name: '', description: '', baseCost: 100, basePrice: 250 },
    ]);
  };

  const handleSaveNewFeature = async (index: number) => {
    const feature = editingFeatures[index];
    if (!feature.name) {
      toast.error('Por favor ingresa un nombre');
      return;
    }

    setIsSaving(true);
    const result = await saveFeature({
      name: feature.name,
      description: feature.description,
      baseCost: feature.baseCost,
      basePrice: feature.basePrice,
    });
    setIsSaving(false);

    if (result) {
      toast.success('Característica guardada');
      setEditingFeatures(editingFeatures.filter((_, i) => i !== index));
    }
  };

  const handleUpdateFeature = async (id: string, name: string, description: string, baseCost: number, basePrice: number) => {
    setIsSaving(true);
    const result = await saveFeature({
      id,
      name,
      description,
      baseCost,
      basePrice,
    });
    setIsSaving(false);

    if (result) {
      toast.success('Característica actualizada');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

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

        {/* Features Configuration */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">
                Características de Agentes
              </h2>
            </div>
            <Button onClick={handleAddFeature} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-4">
            {/* New features being added */}
            {editingFeatures.map((feature, index) => (
              <div key={`new-${index}`} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={feature.name}
                      onChange={e => {
                        const updated = [...editingFeatures];
                        updated[index].name = e.target.value;
                        setEditingFeatures(updated);
                      }}
                      placeholder="Nueva característica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Costo</Label>
                    <Input
                      type="number"
                      value={feature.baseCost}
                      onChange={e => {
                        const updated = [...editingFeatures];
                        updated[index].baseCost = parseFloat(e.target.value) || 0;
                        setEditingFeatures(updated);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Precio</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={feature.basePrice}
                        onChange={e => {
                          const updated = [...editingFeatures];
                          updated[index].basePrice = parseFloat(e.target.value) || 0;
                          setEditingFeatures(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    value={feature.description}
                    onChange={e => {
                      const updated = [...editingFeatures];
                      updated[index].description = e.target.value;
                      setEditingFeatures(updated);
                    }}
                    rows={1}
                    className="resize-none"
                    placeholder="Descripción de la característica"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingFeatures(editingFeatures.filter((_, i) => i !== index))}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveNewFeature(index)}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Guardar
                  </Button>
                </div>
              </div>
            ))}

            {/* Existing features */}
            {features.map(feature => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                onUpdate={handleUpdateFeature}
                onDelete={deleteFeature}
                isSaving={isSaving}
              />
            ))}

            {features.length === 0 && editingFeatures.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay características configuradas.</p>
                <p className="text-sm">Las características predeterminadas se crearán automáticamente al iniciar sesión.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface FeatureRowProps {
  feature: {
    id: string;
    name: string;
    description: string | null;
    base_cost: number;
    base_price: number;
  };
  onUpdate: (id: string, name: string, description: string, baseCost: number, basePrice: number) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
}

const FeatureRow = ({ feature, onUpdate, onDelete, isSaving }: FeatureRowProps) => {
  const [name, setName] = useState(feature.name);
  const [description, setDescription] = useState(feature.description || '');
  const [baseCost, setBaseCost] = useState(Number(feature.base_cost));
  const [basePrice, setBasePrice] = useState(Number(feature.base_price));
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    switch (field) {
      case 'name': setName(value); break;
      case 'description': setDescription(value); break;
      case 'baseCost': setBaseCost(value); break;
      case 'basePrice': setBasePrice(value); break;
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(feature.id, name, description, baseCost, basePrice);
    setHasChanges(false);
  };

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs">Nombre</Label>
          <Input
            value={name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Costo</Label>
          <Input
            type="number"
            value={baseCost}
            onChange={e => handleChange('baseCost', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Precio</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={basePrice}
              onChange={e => handleChange('basePrice', parseFloat(e.target.value) || 0)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(feature.id)}
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
          value={description}
          onChange={e => handleChange('description', e.target.value)}
          rows={1}
          className="resize-none"
        />
      </div>
      {hasChanges && (
        <div className="flex justify-end mt-3">
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;
