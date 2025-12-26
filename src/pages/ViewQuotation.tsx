import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { Quotation } from '@/types/quotation';
import { ArrowLeft, FileDown, Edit, Loader2, Calendar, Mail, Phone, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ViewQuotation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings: agencySettings } = useAgencySettings();

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

      const agentsWithFeatures = await Promise.all(
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
              isEditable: true,
            })),
          };
        })
      );

      setQuotation({
        id: quotationData.id,
        clientName: quotationData.client_name,
        clientEmail: quotationData.client_email,
        clientCompany: quotationData.client_company || undefined,
        clientPhone: quotationData.client_phone || undefined,
        date: quotationData.date,
        validUntil: quotationData.valid_until,
        implementationCost: quotationData.implementation_cost,
        implementationPrice: quotationData.implementation_price,
        monthlyMaintenanceCost: quotationData.monthly_maintenance_cost,
        monthlyMaintenancePrice: quotationData.monthly_maintenance_price,
        discount: quotationData.discount,
        notes: quotationData.notes || undefined,
        status: quotationData.status,
        totalCost: quotationData.total_cost,
        totalPrice: quotationData.total_price,
        profit: quotationData.profit,
        agents: agentsWithFeatures,
      });

      setLoading(false);
    };

    fetchQuotation();
  }, [id, navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Borrador' },
      sent: { variant: 'default', label: 'Enviada' },
      accepted: { variant: 'default', label: 'Aceptada' },
      rejected: { variant: 'destructive', label: 'Rechazada' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  if (!quotation) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cotización no encontrada</p>
          <Button variant="link" onClick={() => navigate('/quotations')}>
            Volver a cotizaciones
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Cotización para {quotation.clientName}
                </h1>
                {getStatusBadge(quotation.status)}
              </div>
              <p className="text-muted-foreground">
                Creada el {format(new Date(quotation.date), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/edit/${quotation.id}`}>
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>
            <Button onClick={() => generateQuotationPDF(quotation, agencySettings)} className="gap-2">
              <FileDown className="w-4 h-4" />
              Descargar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Datos del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{quotation.clientEmail}</span>
                </div>
                {quotation.clientPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{quotation.clientPhone}</span>
                  </div>
                )}
                {quotation.clientCompany && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{quotation.clientCompany}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Válida hasta: {format(new Date(quotation.validUntil), 'dd MMM yyyy', { locale: es })}</span>
                </div>
              </div>
            </div>

            {/* Agents */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Agentes de IA ({quotation.agents.length})
              </h2>
              <div className="space-y-4">
                {quotation.agents.map((agent) => (
                  <div key={agent.id} className="border border-border/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">{agent.name}</h3>
                        {agent.description && (
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(agent.customPrice)} x {agent.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(agent.customPrice * agent.quantity)}
                        </p>
                      </div>
                    </div>
                    {agent.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-2">Características:</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.features.map((f) => (
                            <Badge key={f.id} variant="outline" className="text-xs">
                              {f.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation & Maintenance */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Implementación y Mantenimiento
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Implementación (único)</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(quotation.implementationPrice)}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mantenimiento (mensual)</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(quotation.monthlyMaintenancePrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                  Notas
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 sticky top-6 space-y-4">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Resumen Financiero
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agentes</span>
                  <span className="text-foreground">
                    {formatCurrency(
                      quotation.agents.reduce((sum, a) => sum + a.customPrice * a.quantity, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Implementación</span>
                  <span className="text-foreground">
                    {formatCurrency(quotation.implementationPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mantenimiento/mes</span>
                  <span className="text-foreground">
                    {formatCurrency(quotation.monthlyMaintenancePrice)}
                  </span>
                </div>

                {quotation.discount > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Descuento</span>
                    <span>-{formatCurrency(quotation.discount)}</span>
                  </div>
                )}

                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total Final</span>
                    <span className="font-display font-bold text-primary text-xl">
                      {formatCurrency(quotation.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-success">Ganancia</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(quotation.profit)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Margen: {Math.round((quotation.profit / Math.max(quotation.totalPrice, 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewQuotation;
