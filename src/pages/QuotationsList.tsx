import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { QuotationCard } from '@/components/quotation/QuotationCard';
import { useQuotations } from '@/hooks/useQuotations';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';

const QuotationsList = () => {
  const { quotations, deleteQuotation } = useQuotations();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = quotations
    .filter(q => {
      const matchesSearch = 
        q.clientName.toLowerCase().includes(search.toLowerCase()) ||
        q.clientCompany?.toLowerCase().includes(search.toLowerCase()) ||
        q.clientEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'draft', label: 'Borrador' },
    { value: 'sent', label: 'Enviadas' },
    { value: 'accepted', label: 'Aceptadas' },
    { value: 'rejected', label: 'Rechazadas' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Cotizaciones
            </h1>
            <p className="text-muted-foreground">
              {quotations.length} cotizaciones en total
            </p>
          </div>
          <Link to="/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente, empresa o email..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {statusOptions.map(option => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quotations Grid */}
        {filteredQuotations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotations.map(quotation => (
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
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-2">
              No hay cotizaciones
            </h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'No se encontraron cotizaciones con estos filtros'
                : 'Crea tu primera cotización para empezar'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuotationsList;
