import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuotationCard } from '@/components/quotation/QuotationCard';
import { useSupabaseQuotations, QuotationWithAgents } from '@/hooks/useSupabaseQuotations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, TrendingUp, Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Quotation } from '@/types/quotation';

const Dashboard = () => {
  const { quotations, loading, deleteQuotation, initializeDefaultFeatures } = useSupabaseQuotations();

  useEffect(() => {
    initializeDefaultFeatures();
  }, [initializeDefaultFeatures]);

  const stats = {
    totalQuotations: quotations.length,
    totalValue: quotations.reduce((sum, q) => sum + Number(q.total_price), 0),
    acceptedQuotations: quotations.filter(q => q.status === 'accepted').length,
    monthlyRecurring: quotations
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + Number(q.monthly_maintenance_price), 0),
  };

  const recentQuotations = quotations.slice(0, 4);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const mapToQuotation = (q: QuotationWithAgents): Quotation => ({
    id: q.id,
    clientName: q.client_name,
    clientEmail: q.client_email,
    clientCompany: q.client_company || undefined,
    clientPhone: q.client_phone || undefined,
    date: q.date,
    validUntil: q.valid_until,
    agents: q.agents.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description || undefined,
      customCost: Number(a.custom_cost),
      customPrice: Number(a.custom_price),
      quantity: a.quantity,
      features: a.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description || undefined,
        baseCost: Number(f.base_cost),
        basePrice: Number(f.base_price),
        isEditable: true,
      })),
    })),
    implementationCost: Number(q.implementation_cost),
    implementationPrice: Number(q.implementation_price),
    monthlyMaintenanceCost: Number(q.monthly_maintenance_cost),
    monthlyMaintenancePrice: Number(q.monthly_maintenance_price),
    discount: Number(q.discount),
    notes: q.notes || undefined,
    status: q.status,
    totalCost: Number(q.total_cost),
    totalPrice: Number(q.total_price),
    profit: Number(q.profit),
  });

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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus cotizaciones de agentes de IA
            </p>
          </div>
          <Link to="/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Cotizaciones"
            value={stats.totalQuotations}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatsCard
            title="Valor Total"
            value={formatCurrency(stats.totalValue)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatsCard
            title="Cotizaciones Aceptadas"
            value={stats.acceptedQuotations}
            subtitle={`${Math.round((stats.acceptedQuotations / Math.max(stats.totalQuotations, 1)) * 100)}% tasa de conversión`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Ingresos Recurrentes"
            value={formatCurrency(stats.monthlyRecurring)}
            subtitle="por mes"
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Recent Quotations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Cotizaciones Recientes
            </h2>
            {quotations.length > 4 && (
              <Link to="/quotations">
                <Button variant="ghost" className="gap-2">
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {recentQuotations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentQuotations.map(quotation => (
                <QuotationCard
                  key={quotation.id}
                  quotation={mapToQuotation(quotation)}
                  onDelete={deleteQuotation}
                  onDownload={(q) => generateQuotationPDF(q)}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                No hay cotizaciones
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primera cotización para empezar
              </p>
              <Link to="/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Cotización
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
