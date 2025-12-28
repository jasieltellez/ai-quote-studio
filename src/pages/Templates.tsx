import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSupabaseQuotations, TemplateWithFeatures } from '@/hooks/useSupabaseQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Bot, Trash2, Edit, Save, Loader2, Copy } from 'lucide-react';

const Templates = () => {
  const { templates, features, saveTemplate, deleteTemplate, duplicateTemplate, loading } = useSupabaseQuotations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithFeatures | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseCost, setBaseCost] = useState(500);
  const [basePrice, setBasePrice] = useState(1500);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setBaseCost(500);
    setBasePrice(1500);
    setSelectedFeatureIds([]);
    setEditingTemplate(null);
  };

  const openEditDialog = (template: TemplateWithFeatures) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || '');
    setBaseCost(Number(template.base_cost));
    setBasePrice(Number(template.base_price));
    setSelectedFeatureIds(template.features.map(f => f.feature.id));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name) {
      toast.error('Por favor ingresa un nombre');
      return;
    }

    setIsSaving(true);
    const result = await saveTemplate({
      id: editingTemplate?.id,
      name,
      description,
      baseCost,
      basePrice,
      featureIds: selectedFeatureIds,
    });
    setIsSaving(false);

    if (result) {
      toast.success(editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada');
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Plantillas de Agentes
            </h1>
            <p className="text-muted-foreground">
              Configura las plantillas base para tus cotizaciones
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Chatbot Básico"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Costo Base</Label>
                      <Input
                        type="number"
                        value={baseCost}
                        onChange={e => setBaseCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Base</Label>
                      <Input
                        type="number"
                        value={basePrice}
                        onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descripción del agente..."
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Características Incluidas</Label>
                  {features.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay características disponibles. Ve a Configuración para crear algunas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {features.map(feature => {
                        const isSelected = selectedFeatureIds.includes(feature.id);
                        return (
                          <div
                            key={feature.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => toggleFeature(feature.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox checked={isSelected} />
                              <div>
                                <p className="font-medium text-sm">{feature.name}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                                <p className="text-xs text-primary mt-1">
                                  {formatCurrency(Number(feature.base_price))}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {template.features.length} características
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 3).map(tf => (
                    <span
                      key={tf.id}
                      className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                    >
                      {tf.feature.name}
                    </span>
                  ))}
                  {template.features.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground">
                      +{template.features.length - 3} más
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio base</p>
                    <p className="font-display font-bold text-primary">
                      {formatCurrency(Number(template.base_price))}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(template)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => duplicateTemplate(template.id)}
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">
              No hay plantillas
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera plantilla de agente
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Plantilla
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Templates;
