import { useState, useEffect } from 'react';
import { Quotation, AgentTemplate, defaultAgentFeatures } from '@/types/quotation';

const STORAGE_KEY = 'ai-agency-quotations';
const TEMPLATES_KEY = 'ai-agency-templates';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setQuotations(JSON.parse(stored));
    }

    const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      // Default templates
      const defaultTemplates: AgentTemplate[] = [
        {
          id: 'chatbot-basic',
          name: 'Chatbot Básico',
          description: 'Agente conversacional con funciones básicas',
          defaultFeatures: defaultAgentFeatures.slice(0, 3),
          baseCost: 500,
          basePrice: 1500,
        },
        {
          id: 'chatbot-advanced',
          name: 'Chatbot Avanzado',
          description: 'Agente con integraciones y análisis',
          defaultFeatures: defaultAgentFeatures.slice(0, 6),
          baseCost: 1200,
          basePrice: 3500,
        },
        {
          id: 'virtual-assistant',
          name: 'Asistente Virtual Completo',
          description: 'Solución integral con todas las funciones',
          defaultFeatures: defaultAgentFeatures,
          baseCost: 2000,
          basePrice: 5500,
        },
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
    }
  }, []);

  const saveQuotation = (quotation: Quotation) => {
    const updated = [...quotations.filter(q => q.id !== quotation.id), quotation];
    setQuotations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteQuotation = (id: string) => {
    const updated = quotations.filter(q => q.id !== id);
    setQuotations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const saveTemplate = (template: AgentTemplate) => {
    const updated = [...templates.filter(t => t.id !== template.id), template];
    setTemplates(updated);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  };

  return {
    quotations,
    templates,
    saveQuotation,
    deleteQuotation,
    saveTemplate,
    deleteTemplate,
  };
};
