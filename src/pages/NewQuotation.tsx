import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AgentSelector } from '@/components/quotation/AgentSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuotations } from '@/hooks/useQuotations';
import { Quotation, QuotationAgent } from '@/types/quotation';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { Save, FileDown, ArrowLeft, Calculator } from 'lucide-react';

const NewQuotation = () => {
  const navigate = useNavigate();
  const { templates, saveQuotation } = useQuotations();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [agents, setAgents] = useState<QuotationAgent[]>([]);
  const [implementationCost, setImplementationCost] = useState(500);
  const [implementationPrice, setImplementationPrice] = useState(1500);
  const [monthlyMaintenanceCost, setMonthlyMaintenanceCost] = useState(200);
  const [monthlyMaintenancePrice, setMonthlyMaintenancePrice] = useState(500);
  const [notes, setNotes] = useState('');

  const calculateTotals = () => {
    const agentsTotalCost = agents.reduce((sum, a) => sum + (a.customCost * a.quantity), 0);
    const agentsTotalPrice = agents.reduce((sum, a) => sum + (a.customPrice * a.quantity), 0);
    
    const totalCost = agentsTotalCost + implementationCost + monthlyMaintenanceCost;
    const totalPrice = agentsTotalPrice + implementationPrice + monthlyMaintenancePrice;
    const profit = totalPrice - totalCost;

    return { totalCost, totalPrice, profit, agentsTotalCost, agentsTotalPrice };
  };

  const totals = calculateTotals();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const createQuotation = (): Quotation => {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 30);

    return {
      id: crypto.randomUUID(),
      clientName,
      clientEmail,
      clientCompany,
      clientPhone,
      date: now.toISOString(),
      validUntil: validUntil.toISOString(),
      agents,
      implementationCost,
      implementationPrice,
      monthlyMaintenanceCost,
      monthlyMaintenancePrice,
      notes,
      status: 'draft',
      totalCost: totals.totalCost,
      totalPrice: totals.totalPrice,
      profit: totals.profit,
    };
  };

  const handleSave = () => {
    if (!clientName || !clientEmail) {
      toast.error('Por favor completa los datos del cliente');
      return;
    }
    if (agents.length === 0) {
      toast.error('Por favor agrega al menos un agente');
      return;
    }

    const quotation = createQuotation();
    saveQuotation(quotation);
    toast.success('Cotización guardada correctamente');
    navigate('/');
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

    const quotation = createQuotation();
    saveQuotation(quotation);
    generateQuotationPDF(quotation);
    toast.success('PDF generado correctamente');
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Nueva Cotización
            </h1>
            <p className="text-muted-foreground">
              Crea una cotización personalizada para tu cliente
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

            {/* Agent Selection */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Agentes de IA
              </h2>
              <AgentSelector
                templates={templates}
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
                
                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total Inicial</span>
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
                <Button onClick={handleSave} className="w-full gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Cotización
                </Button>
                <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
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

export default NewQuotation;
