import { Quotation } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuotationCardProps {
  quotation: Quotation;
  onDelete: (id: string) => void;
  onDownload: (quotation: Quotation) => void;
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/20 text-primary',
  accepted: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
};

const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

export const QuotationCard = ({ quotation, onDelete, onDownload }: QuotationCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="glass rounded-xl p-5 animate-slide-up hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {quotation.clientName}
            </h3>
            <p className="text-sm text-muted-foreground">{quotation.clientCompany}</p>
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          statusColors[quotation.status]
        )}>
          {statusLabels[quotation.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Implementación</p>
          <p className="font-semibold text-foreground">
            {formatCurrency(quotation.implementationPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Mantenimiento/mes</p>
          <p className="font-semibold text-foreground">
            {formatCurrency(quotation.monthlyMaintenancePrice)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-display font-bold text-primary text-lg">
            {formatCurrency(quotation.totalPrice)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/quotation/${quotation.id}`}>
            <Button variant="ghost" size="icon" title="Ver">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={`/edit/${quotation.id}`}>
            <Button variant="ghost" size="icon" title="Editar">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDownload(quotation)}
            title="Descargar PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(quotation.id)}
            className="text-destructive hover:text-destructive"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
