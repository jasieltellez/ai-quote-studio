import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '@/types/quotation';
import { AgencySettings } from '@/hooks/useAgencySettings';

export interface PDFGeneratorOptions {
  quotation: Quotation;
  agencySettings?: AgencySettings | null;
}

export const generateQuotationPDF = (quotation: Quotation, agencySettings?: AgencySettings | null) => {
  const doc = new jsPDF();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const agencyName = agencySettings?.agency_name || 'AI AGENCY';
  const agencyAddress = agencySettings?.address || '';
  const agencyPhone = agencySettings?.phone || '';
  const agencyEmail = agencySettings?.email || '';
  const agencyWebsite = agencySettings?.website || '';

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 220, 45, 'F');
  
  // Logo handling
  let textStartX = 20;
  
  if (agencySettings?.logo_url) {
    // We'll add the logo if available - for now we'll just use text
    // Note: Adding images from URLs requires async loading
    textStartX = 20;
  }
  
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(agencyName.toUpperCase(), textStartX, 22);
  
  // Tagline / Contact info in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  let headerInfoY = 30;
  if (agencyEmail) {
    doc.text(agencyEmail, textStartX, headerInfoY);
    headerInfoY += 5;
  }
  if (agencyPhone) {
    doc.text(agencyPhone, textStartX, headerInfoY);
  }
  
  // Quote number and date
  doc.setTextColor(20, 184, 166);
  doc.setFontSize(12);
  doc.text(`Cotización #${quotation.id.slice(0, 8).toUpperCase()}`, 140, 20);
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date(quotation.date).toLocaleDateString('es-MX')}`, 140, 28);
  doc.text(`Válida hasta: ${new Date(quotation.validUntil).toLocaleDateString('es-MX')}`, 140, 35);

  // Client info
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Cliente', 20, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${quotation.clientName}`, 20, 70);
  doc.text(`Empresa: ${quotation.clientCompany || 'N/A'}`, 20, 77);
  doc.text(`Email: ${quotation.clientEmail}`, 20, 84);
  doc.text(`Teléfono: ${quotation.clientPhone || 'N/A'}`, 20, 91);

  // Agents table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Agentes de IA', 20, 108);

  const agentRows = quotation.agents.map(agent => [
    agent.name,
    agent.quantity.toString(),
    agent.features.map(f => f.name).join(', '),
    formatCurrency(agent.customPrice),
  ]);

  autoTable(doc, {
    startY: 113,
    head: [['Agente', 'Cantidad', 'Características', 'Precio']],
    body: agentRows,
    theme: 'striped',
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 80 },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // Get the Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Calculate subtotal for display
  const subtotal = quotation.implementationPrice + quotation.monthlyMaintenancePrice + 
    quotation.agents.reduce((sum, a) => sum + (a.customPrice * a.quantity), 0);

  // Summary
  const summaryHeight = quotation.discount > 0 ? 70 : 55;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(110, finalY, 80, summaryHeight, 3, 3, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Implementación:', 115, finalY + 12);
  doc.text(formatCurrency(quotation.implementationPrice), 180, finalY + 12, { align: 'right' });
  
  doc.text('Mantenimiento Mensual:', 115, finalY + 22);
  doc.text(formatCurrency(quotation.monthlyMaintenancePrice), 180, finalY + 22, { align: 'right' });

  let currentY = finalY + 30;

  if (quotation.discount > 0) {
    doc.text('Subtotal:', 115, currentY);
    doc.text(formatCurrency(subtotal), 180, currentY, { align: 'right' });
    currentY += 10;
    
    doc.setTextColor(220, 38, 38);
    doc.text('Descuento:', 115, currentY);
    doc.text(`-${formatCurrency(quotation.discount)}`, 180, currentY, { align: 'right' });
    currentY += 8;
    doc.setTextColor(60, 60, 60);
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(115, currentY, 185, currentY);
  currentY += 12;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 184, 166);
  doc.text('Total Final:', 115, currentY);
  doc.text(formatCurrency(quotation.totalPrice), 180, currentY, { align: 'right' });

  // Notes
  if (quotation.notes) {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas:', 20, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quotation.notes, 80);
    doc.text(splitNotes, 20, finalY + 18);
  }

  // Footer with agency info
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 30, 220, 30, 'F');
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  
  // Agency contact in footer
  if (agencyAddress) {
    doc.text(agencyAddress, 105, pageHeight - 22, { align: 'center' });
  }
  if (agencyWebsite) {
    doc.setTextColor(20, 184, 166);
    doc.text(agencyWebsite, 105, pageHeight - 16, { align: 'center' });
  }
  
  doc.setTextColor(150, 150, 150);
  doc.text('Esta cotización es válida por 30 días a partir de la fecha de emisión.', 105, pageHeight - 10, { align: 'center' });

  // Save
  doc.save(`cotizacion-${quotation.clientName.replace(/\s+/g, '-').toLowerCase()}-${quotation.id.slice(0, 8)}.pdf`);
};
