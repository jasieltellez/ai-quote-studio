import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuotationCard } from '@/components/quotation/QuotationCard';
import { useQuotations } from '@/hooks/useQuotations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, TrendingUp, Users, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { quotations, deleteQuotation } = useQuotations();

  const stats = {
    totalQuotations: quotations.length,
    totalValue: quotations.reduce((sum, q) => sum + q.totalPrice, 0),
    acceptedQuotations: quotations.filter(q => q.status === 'accepted').length,
    monthlyRecurring: quotations
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + q.monthlyMaintenancePrice, 0),
  };

  const recentQuotations = quotations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
                  quotation={quotation}
                  onDelete={deleteQuotation}
                  onDownload={generateQuotationPDF}
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
