export interface AgentFeature {
  id: string;
  name: string;
  description?: string;
  baseCost: number; // Costo para la agencia
  basePrice: number; // Precio para el cliente
  isEditable: boolean;
}

export interface QuotationAgent {
  id: string;
  name: string;
  description?: string;
  features: AgentFeature[];
  customCost: number; // Costo modificado para esta cotización
  customPrice: number; // Precio modificado para esta cotización
  quantity: number;
}

export interface Quotation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientPhone?: string;
  date: string;
  validUntil: string;
  agents: QuotationAgent[];
  implementationCost: number;
  implementationPrice: number;
  monthlyMaintenanceCost: number;
  monthlyMaintenancePrice: number;
  discount: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  totalCost: number;
  totalPrice: number;
  profit: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultFeatures: AgentFeature[];
  baseCost: number;
  basePrice: number;
}

export const defaultAgentFeatures: AgentFeature[] = [
  {
    id: 'nlp-basic',
    name: 'Procesamiento de Lenguaje Natural',
    description: 'Comprensión y generación de texto',
    baseCost: 200,
    basePrice: 450,
    isEditable: true,
  },
  {
    id: 'voice-integration',
    name: 'Integración de Voz',
    description: 'Reconocimiento y síntesis de voz',
    baseCost: 350,
    basePrice: 750,
    isEditable: true,
  },
  {
    id: 'multi-language',
    name: 'Soporte Multiidioma',
    description: 'Español, Inglés, Portugués',
    baseCost: 150,
    basePrice: 350,
    isEditable: true,
  },
  {
    id: 'crm-integration',
    name: 'Integración CRM',
    description: 'Conexión con sistemas CRM',
    baseCost: 400,
    basePrice: 900,
    isEditable: true,
  },
  {
    id: 'analytics',
    name: 'Dashboard Analítico',
    description: 'Métricas y reportes en tiempo real',
    baseCost: 250,
    basePrice: 550,
    isEditable: true,
  },
  {
    id: 'whatsapp',
    name: 'Integración WhatsApp',
    description: 'Canal de WhatsApp Business',
    baseCost: 300,
    basePrice: 650,
    isEditable: true,
  },
  {
    id: 'custom-training',
    name: 'Entrenamiento Personalizado',
    description: 'Fine-tuning con datos del cliente',
    baseCost: 500,
    basePrice: 1200,
    isEditable: true,
  },
  {
    id: 'api-access',
    name: 'Acceso API',
    description: 'API REST para integraciones',
    baseCost: 200,
    basePrice: 450,
    isEditable: true,
  },
];
