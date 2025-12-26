import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AgentSelectorDB } from '@/components/quotation/AgentSelectorDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseQuotations, TemplateWithFeatures } from '@/hooks/useSupabaseQuotations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Quotation } from '@/types/quotation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, FileDown, ArrowLeft, Calculator, Loader2 } from 'lucide-react';

interface SelectedAgent {
  id: string;
  name: string;
  description?: string;
  customCost: number;
  customPrice: number;
  quantity: number;
  features: {
    id: string;
    name: string;
    description?: string;
    baseCost: number;
    basePrice: number;
  }[];
}

const EditQuotation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, features, loading: dataLoading } = useSupabaseQuotations();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [agents, setAgents] = useState<SelectedAgent[]>([]);
  const [implementationCost, setImplementationCost] = useState(500);
  const [implementationPrice, setImplementationPrice] = useState(1500);
  const [monthlyMaintenanceCost, setMonthlyMaintenanceCost] = useState(200);
  const [monthlyMaintenancePrice, setMonthlyMaintenancePrice] = useState(500);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>('draft');

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!id) return;

      const { data: quotationData, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !quotationData) {
        console.error('Error fetching quotation:', error);
        navigate('/quotations');
        return;
      }

      // Fetch agents
      const { data: agentsData } = await supabase
        .from('quotation_agents')
        .select('*')
        .eq('quotation_id', id);

      const agentsWithFeatures: SelectedAgent[] = await Promise.all(
        (agentsData || []).map(async (agent) => {
          const { data: featuresData } = await supabase
            .from('quotation_agent_features')
            .select('*')
            .eq('quotation_agent_id', agent.id);

          return {
            id: agent.id,
            name: agent.name,
            description: agent.description || undefined,
            customCost: agent.custom_cost,
            customPrice: agent.custom_price,
            quantity: agent.quantity,
            features: (featuresData || []).map(f => ({
              id: f.id,
              name: f.name,
              description: f.description || undefined,
              baseCost: f.base_cost,
              basePrice: f.base_price,
            })),
          };
        })
      );

      setClientName(quotationData.client_name);
      setClientEmail(quotationData.client_email);
      setClientCompany(quotationData.client_company || '');
      setClientPhone(quotationData.client_phone || '');
      setImplementationCost(quotationData.implementation_cost);
      setImplementationPrice(quotationData.implementation_price);
      setMonthlyMaintenanceCost(quotationData.monthly_maintenance_cost);
      setMonthlyMaintenancePrice(quotationData.monthly_maintenance_price);
      setDiscount(quotationData.discount);
      setNotes(quotationData.notes || '');
      setStatus(quotationData.status);
      setAgents(agentsWithFeatures);
      setLoading(false);
    };

    fetchQuotation();
  }, [id, navigate]);

  const calculateTotals = () => {
    const agentsTotalCost = agents.reduce((sum, a) => sum + (a.customCost * a.quantity), 0);
    const agentsTotalPrice = agents.reduce((sum, a) => sum + (a.customPrice * a.quantity), 0);
    
    const subtotal = agentsTotalPrice + implementationPrice + monthlyMaintenancePrice;
    const totalCost = agentsTotalCost + implementationCost + monthlyMaintenanceCost;
    const totalPrice = subtotal - discount;
    const profit = totalPrice - totalCost;

    return { totalCost, totalPrice, profit, agentsTotalCost, agentsTotalPrice, subtotal };
  };

  const totals = calculateTotals();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const createQuotationForPDF = (): Quotation => {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30);

    return {
      id: id!,
      clientName,
      clientEmail,
      clientCompany,
      clientPhone,
      date: now.toISOString(),
      validUntil: validUntil.toISOString(),
      agents: agents.map(a => ({
        ...a,
        features: a.features.map(f => ({ ...f, isEditable: true })),
      })),
      implementationCost,
      implementationPrice,
      monthlyMaintenanceCost,
      monthlyMaintenancePrice,
      discount,
      notes,
      status,
      totalCost: totals.totalCost,
      totalPrice: totals.totalPrice,
      profit: totals.profit,
    };
  };

  const handleSave = async () => {
    if (!clientName || !clientEmail) {
      toast.error('Por favor completa los datos del cliente');
      return;
    }
    if (agents.length === 0) {
      toast.error('Por favor agrega al menos un agente');
      return;
    }

    setIsSaving(true);

    // Update quotation
    const { error: quotationError } = await supabase
      .from('quotations')
      .update({
        client_name: clientName,
        client_email: clientEmail,
        client_company: clientCompany || null,
        client_phone: clientPhone || null,
        implementation_cost: implementationCost,
        implementation_price: implementationPrice,
        monthly_maintenance_cost: monthlyMaintenanceCost,
        monthly_maintenance_price: monthlyMaintenancePrice,
        discount,
        notes: notes || null,
        status,
        total_cost: totals.totalCost,
        total_price: totals.totalPrice,
        profit: totals.profit,
      })
      .eq('id', id);

    if (quotationError) {
      toast.error('Error al actualizar la cotización');
      console.error('Error updating quotation:', quotationError);
      setIsSaving(false);
      return;
    }

    // Delete existing agents and features
    const { data: existingAgents } = await supabase
      .from('quotation_agents')
      .select('id')
      .eq('quotation_id', id);

    if (existingAgents) {
      for (const agent of existingAgents) {
        await supabase
          .from('quotation_agent_features')
          .delete()
          .eq('quotation_agent_id', agent.id);
      }
    }

    await supabase
      .from('quotation_agents')
      .delete()
      .eq('quotation_id', id);

    // Insert new agents
    for (const agent of agents) {
      const { data: agentData, error: agentError } = await supabase
        .from('quotation_agents')
        .insert({
          quotation_id: id,
          name: agent.name,
          description: agent.description,
          custom_cost: agent.customCost,
          custom_price: agent.customPrice,
          quantity: agent.quantity,
        })
        .select()
        .single();

      if (agentError) {
        console.error('Error saving agent:', agentError);
        continue;
      }

      // Insert features for this agent
      for (const feature of agent.features) {
        await supabase
          .from('quotation_agent_features')
          .insert({
            quotation_agent_id: agentData.id,
            name: feature.name,
            description: feature.description,
            base_cost: feature.baseCost,
            base_price: feature.basePrice,
          });
      }
    }

    setIsSaving(false);
    toast.success('Cotización actualizada correctamente');
    navigate(`/quotation/${id}`);
  };

  const handleDownload = () => {
    if (!clientName || !clientEmail) {
      toast.error('Por favor completa los datos del cliente');
      return;
    }
    if (agents.length === 0) {
      toast.error('Por favor agrega al menos un agente');
      return;
    }

    const quotation = createQuotationForPDF();
    generateQuotationPDF(quotation);
    toast.success('PDF generado correctamente');
  };

  if (loading || dataLoading) {
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/quotation/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Editar Cotización
            </h1>
            <p className="text-muted-foreground">
              Modifica los detalles de la cotización
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">Empresa</Label>
                  <Input
                    id="clientCompany"
                    value={clientCompany}
                    onChange={e => setClientCompany(e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Teléfono</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="+52 123 456 7890"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Estado de la Cotización
              </h2>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="accepted">Aceptada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agent Selection */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Agentes de IA
              </h2>
              <AgentSelectorDB
                templates={templates}
                features={features}
                selectedAgents={agents}
                onAgentsChange={setAgents}
              />
            </div>

            {/* Implementation & Maintenance */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Implementación y Mantenimiento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Implementación (único)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Costo</Label>
                      <Input
                        type="number"
                        value={implementationCost}
                        onChange={e => setImplementationCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Precio</Label>
                      <Input
                        type="number"
                        value={implementationPrice}
                        onChange={e => setImplementationPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Mantenimiento (mensual)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Costo</Label>
                      <Input
                        type="number"
                        value={monthlyMaintenanceCost}
                        onChange={e => setMonthlyMaintenanceCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Precio</Label>
                      <Input
                        type="number"
                        value={monthlyMaintenancePrice}
                        onChange={e => setMonthlyMaintenancePrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Notas Adicionales
              </h2>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas o condiciones especiales para esta cotización..."
                rows={4}
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-6 space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Resumen
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agentes ({agents.length})</span>
                  <span className="text-foreground">{formatCurrency(totals.agentsTotalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Implementación</span>
                  <span className="text-foreground">{formatCurrency(implementationPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mantenimiento/mes</span>
                  <span className="text-foreground">{formatCurrency(monthlyMaintenancePrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(totals.subtotal)}</span>
                </div>

                {/* Discount Input */}
                <div className="border-t border-border/50 pt-4 space-y-2">
                  <Label className="text-sm text-muted-foreground">Descuento</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                  />
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Descuento aplicado</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total Final</span>
                    <span className="font-display font-bold text-primary text-xl">
                      {formatCurrency(totals.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-success">Ganancia estimada</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(totals.profit)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Margen: {Math.round((totals.profit / Math.max(totals.totalPrice, 1)) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={handleSave} className="w-full gap-2" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </Button>
                <Button onClick={handleDownload} variant="outline" className="w-full gap-2" disabled={isSaving}>
                  <FileDown className="w-4 h-4" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditQuotation;
