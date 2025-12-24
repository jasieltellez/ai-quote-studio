import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type QuotationRow = Database['public']['Tables']['quotations']['Row'];
type QuotationAgentRow = Database['public']['Tables']['quotation_agents']['Row'];
type QuotationAgentFeatureRow = Database['public']['Tables']['quotation_agent_features']['Row'];
type AgentTemplateRow = Database['public']['Tables']['agent_templates']['Row'];
type AgentFeatureRow = Database['public']['Tables']['agent_features']['Row'];
type TemplateFeatureRow = Database['public']['Tables']['template_features']['Row'];

export interface QuotationWithAgents extends QuotationRow {
  agents: (QuotationAgentRow & { features: QuotationAgentFeatureRow[] })[];
}

export interface TemplateWithFeatures extends AgentTemplateRow {
  features: (TemplateFeatureRow & { feature: AgentFeatureRow })[];
}

export const useSupabaseQuotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<QuotationWithAgents[]>([]);
  const [templates, setTemplates] = useState<TemplateWithFeatures[]>([]);
  const [features, setFeatures] = useState<AgentFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    if (!user) return;

    const { data: quotationsData, error: quotationsError } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (quotationsError) {
      console.error('Error fetching quotations:', quotationsError);
      return;
    }

    // Fetch agents and features for each quotation
    const quotationsWithAgents: QuotationWithAgents[] = await Promise.all(
      (quotationsData || []).map(async (quotation) => {
        const { data: agentsData } = await supabase
          .from('quotation_agents')
          .select('*')
          .eq('quotation_id', quotation.id);

        const agentsWithFeatures = await Promise.all(
          (agentsData || []).map(async (agent) => {
            const { data: featuresData } = await supabase
              .from('quotation_agent_features')
              .select('*')
              .eq('quotation_agent_id', agent.id);

            return { ...agent, features: featuresData || [] };
          })
        );

        return { ...quotation, agents: agentsWithFeatures };
      })
    );

    setQuotations(quotationsWithAgents);
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    const { data: templatesData, error: templatesError } = await supabase
      .from('agent_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      return;
    }

    // Fetch features for each template
    const templatesWithFeatures: TemplateWithFeatures[] = await Promise.all(
      (templatesData || []).map(async (template) => {
        const { data: templateFeaturesData } = await supabase
          .from('template_features')
          .select('*, feature:agent_features(*)')
          .eq('template_id', template.id);

        return {
          ...template,
          features: (templateFeaturesData || []).map((tf: any) => ({
            ...tf,
            feature: tf.feature,
          })),
        };
      })
    );

    setTemplates(templatesWithFeatures);
  }, [user]);

  const fetchFeatures = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('agent_features')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching features:', error);
      return;
    }

    setFeatures(data || []);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      await Promise.all([fetchQuotations(), fetchTemplates(), fetchFeatures()]);
      setLoading(false);
    };

    loadData();
  }, [user, fetchQuotations, fetchTemplates, fetchFeatures]);

  const saveQuotation = async (quotation: {
    clientName: string;
    clientEmail: string;
    clientCompany?: string;
    clientPhone?: string;
    implementationCost: number;
    implementationPrice: number;
    monthlyMaintenanceCost: number;
    monthlyMaintenancePrice: number;
    notes?: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    totalCost: number;
    totalPrice: number;
    profit: number;
    agents: {
      name: string;
      description?: string;
      customCost: number;
      customPrice: number;
      quantity: number;
      features: {
        name: string;
        description?: string;
        baseCost: number;
        basePrice: number;
      }[];
    }[];
  }) => {
    if (!user) return null;

    // Insert quotation
    const { data: quotationData, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        user_id: user.id,
        client_name: quotation.clientName,
        client_email: quotation.clientEmail,
        client_company: quotation.clientCompany,
        client_phone: quotation.clientPhone,
        implementation_cost: quotation.implementationCost,
        implementation_price: quotation.implementationPrice,
        monthly_maintenance_cost: quotation.monthlyMaintenanceCost,
        monthly_maintenance_price: quotation.monthlyMaintenancePrice,
        notes: quotation.notes,
        status: quotation.status,
        total_cost: quotation.totalCost,
        total_price: quotation.totalPrice,
        profit: quotation.profit,
      })
      .select()
      .single();

    if (quotationError) {
      toast.error('Error al guardar la cotización');
      console.error('Error saving quotation:', quotationError);
      return null;
    }

    // Insert agents
    for (const agent of quotation.agents) {
      const { data: agentData, error: agentError } = await supabase
        .from('quotation_agents')
        .insert({
          quotation_id: quotationData.id,
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

    await fetchQuotations();
    return quotationData;
  };

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar la cotización');
      console.error('Error deleting quotation:', error);
      return;
    }

    await fetchQuotations();
    toast.success('Cotización eliminada');
  };

  const saveTemplate = async (template: {
    id?: string;
    name: string;
    description?: string;
    baseCost: number;
    basePrice: number;
    featureIds: string[];
  }) => {
    if (!user) return null;

    if (template.id) {
      // Update existing template
      const { error: updateError } = await supabase
        .from('agent_templates')
        .update({
          name: template.name,
          description: template.description,
          base_cost: template.baseCost,
          base_price: template.basePrice,
        })
        .eq('id', template.id);

      if (updateError) {
        toast.error('Error al actualizar la plantilla');
        console.error('Error updating template:', updateError);
        return null;
      }

      // Delete existing template features
      await supabase
        .from('template_features')
        .delete()
        .eq('template_id', template.id);

      // Insert new template features
      for (const featureId of template.featureIds) {
        const feature = features.find(f => f.id === featureId);
        if (feature) {
          await supabase
            .from('template_features')
            .insert({
              template_id: template.id,
              feature_id: featureId,
              base_cost: feature.base_cost,
              base_price: feature.base_price,
            });
        }
      }
    } else {
      // Insert new template
      const { data: templateData, error: templateError } = await supabase
        .from('agent_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          base_cost: template.baseCost,
          base_price: template.basePrice,
        })
        .select()
        .single();

      if (templateError) {
        toast.error('Error al crear la plantilla');
        console.error('Error creating template:', templateError);
        return null;
      }

      // Insert template features
      for (const featureId of template.featureIds) {
        const feature = features.find(f => f.id === featureId);
        if (feature) {
          await supabase
            .from('template_features')
            .insert({
              template_id: templateData.id,
              feature_id: featureId,
              base_cost: feature.base_cost,
              base_price: feature.base_price,
            });
        }
      }
    }

    await fetchTemplates();
    return true;
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('agent_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar la plantilla');
      console.error('Error deleting template:', error);
      return;
    }

    await fetchTemplates();
    toast.success('Plantilla eliminada');
  };

  const saveFeature = async (feature: {
    id?: string;
    name: string;
    description?: string;
    baseCost: number;
    basePrice: number;
  }) => {
    if (!user) return null;

    if (feature.id) {
      const { error } = await supabase
        .from('agent_features')
        .update({
          name: feature.name,
          description: feature.description,
          base_cost: feature.baseCost,
          base_price: feature.basePrice,
        })
        .eq('id', feature.id);

      if (error) {
        toast.error('Error al actualizar la característica');
        console.error('Error updating feature:', error);
        return null;
      }
    } else {
      const { error } = await supabase
        .from('agent_features')
        .insert({
          user_id: user.id,
          name: feature.name,
          description: feature.description,
          base_cost: feature.baseCost,
          base_price: feature.basePrice,
        });

      if (error) {
        toast.error('Error al crear la característica');
        console.error('Error creating feature:', error);
        return null;
      }
    }

    await fetchFeatures();
    return true;
  };

  const deleteFeature = async (id: string) => {
    const { error } = await supabase
      .from('agent_features')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar la característica');
      console.error('Error deleting feature:', error);
      return;
    }

    await fetchFeatures();
    toast.success('Característica eliminada');
  };

  const initializeDefaultFeatures = async () => {
    if (!user || features.length > 0) return;

   /* const defaultFeatures = [
      { name: 'Procesamiento de Lenguaje Natural', description: 'Comprensión y generación de texto', baseCost: 200, basePrice: 450 },
      { name: 'Integración de Voz', description: 'Reconocimiento y síntesis de voz', baseCost: 350, basePrice: 750 },
      { name: 'Soporte Multiidioma', description: 'Español, Inglés, Portugués', baseCost: 150, basePrice: 350 },
      { name: 'Integración CRM', description: 'Conexión con sistemas CRM', baseCost: 400, basePrice: 900 },
      { name: 'Dashboard Analítico', description: 'Métricas y reportes en tiempo real', baseCost: 250, basePrice: 550 },
      { name: 'Integración WhatsApp', description: 'Canal de WhatsApp Business', baseCost: 300, basePrice: 650 },
      { name: 'Entrenamiento Personalizado', description: 'Fine-tuning con datos del cliente', baseCost: 500, basePrice: 1200 },
      { name: 'Acceso API', description: 'API REST para integraciones', baseCost: 200, basePrice: 450 },
    ];

    for (const feature of defaultFeatures) {
      await supabase
        .from('agent_features')
        .insert({
          user_id: user.id,
          name: feature.name,
          description: feature.description,
          base_cost: feature.baseCost,
          base_price: feature.basePrice,
        });
    }

    await fetchFeatures();
  };*/

  return {
    quotations,
    templates,
    features,
    loading,
    saveQuotation,
    deleteQuotation,
    saveTemplate,
    deleteTemplate,
    saveFeature,
    deleteFeature,
    initializeDefaultFeatures,
    refetch: () => Promise.all([fetchQuotations(), fetchTemplates(), fetchFeatures()]),
  };
};
