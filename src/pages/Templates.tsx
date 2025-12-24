import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useQuotations } from '@/hooks/useQuotations';
import { AgentTemplate, AgentFeature, defaultAgentFeatures } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Bot, Trash2, Edit, Save } from 'lucide-react';

const Templates = () => {
  const { templates, saveTemplate, deleteTemplate } = useQuotations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AgentTemplate | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseCost, setBaseCost] = useState(500);
  const [basePrice, setBasePrice] = useState(1500);
  const [selectedFeatures, setSelectedFeatures] = useState<AgentFeature[]>([]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setBaseCost(500);
    setBasePrice(1500);
    setSelectedFeatures([]);
    setEditingTemplate(null);
  };

  const openEditDialog = (template: AgentTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setBaseCost(template.baseCost);
    setBasePrice(template.basePrice);
    setSelectedFeatures([...template.defaultFeatures]);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name) {
      toast.error('Por favor ingresa un nombre');
      return;
    }

    const template: AgentTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name,
      description,
      defaultFeatures: selectedFeatures,
      baseCost,
      basePrice,
    };

    saveTemplate(template);
    toast.success(editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada');
    setIsDialogOpen(false);
    resetForm();
  };

  const toggleFeature = (feature: AgentFeature) => {
    const exists = selectedFeatures.some(f => f.id === feature.id);
    if (exists) {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

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
                  <div className="grid grid-cols-2 gap-3">
                    {defaultAgentFeatures.map(feature => {
                      const isSelected = selectedFeatures.some(f => f.id === feature.id);
                      return (
                        <div
                          key={feature.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => toggleFeature(feature)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={isSelected} />
                            <div>
                              <p className="font-medium text-sm">{feature.name}</p>
                              <p className="text-xs text-muted-foreground">{feature.description}</p>
                              <p className="text-xs text-primary mt-1">
                                {formatCurrency(feature.basePrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
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
                      {template.defaultFeatures.length} características
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.defaultFeatures.slice(0, 3).map(feature => (
                  <span
                    key={feature.id}
                    className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                  >
                    {feature.name}
                  </span>
                ))}
                {template.defaultFeatures.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground">
                    +{template.defaultFeatures.length - 3} más
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Precio base</p>
                  <p className="font-display font-bold text-primary">
                    {formatCurrency(template.basePrice)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      deleteTemplate(template.id);
                      toast.success('Plantilla eliminada');
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Templates;
