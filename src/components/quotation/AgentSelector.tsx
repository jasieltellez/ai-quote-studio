import { useState } from 'react';
import { AgentTemplate, QuotationAgent, AgentFeature, defaultAgentFeatures } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Bot, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentSelectorProps {
  templates: AgentTemplate[];
  selectedAgents: QuotationAgent[];
  onAgentsChange: (agents: QuotationAgent[]) => void;
}

export const AgentSelector = ({ templates, selectedAgents, onAgentsChange }: AgentSelectorProps) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const addAgent = (template: AgentTemplate) => {
    const newAgent: QuotationAgent = {
      id: `${template.id}-${Date.now()}`,
      name: template.name,
      description: template.description,
      features: [...template.defaultFeatures],
      customCost: template.baseCost,
      customPrice: template.basePrice,
      quantity: 1,
    };
    onAgentsChange([...selectedAgents, newAgent]);
  };

  const removeAgent = (agentId: string) => {
    onAgentsChange(selectedAgents.filter(a => a.id !== agentId));
  };

  const updateAgentQuantity = (agentId: string, delta: number) => {
    onAgentsChange(
      selectedAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, quantity: Math.max(1, agent.quantity + delta) }
          : agent
      )
    );
  };

  const updateAgentPrice = (agentId: string, field: 'customCost' | 'customPrice', value: number) => {
    onAgentsChange(
      selectedAgents.map(agent =>
        agent.id === agentId ? { ...agent, [field]: value } : agent
      )
    );
  };

  const toggleFeature = (agentId: string, feature: AgentFeature) => {
    onAgentsChange(
      selectedAgents.map(agent => {
        if (agent.id !== agentId) return agent;
        
        const hasFeature = agent.features.some(f => f.id === feature.id);
        let newFeatures: AgentFeature[];
        let costDelta = 0;
        let priceDelta = 0;

        if (hasFeature) {
          newFeatures = agent.features.filter(f => f.id !== feature.id);
          costDelta = -feature.baseCost;
          priceDelta = -feature.basePrice;
        } else {
          newFeatures = [...agent.features, feature];
          costDelta = feature.baseCost;
          priceDelta = feature.basePrice;
        }

        return {
          ...agent,
          features: newFeatures,
          customCost: agent.customCost + costDelta,
          customPrice: agent.customPrice + priceDelta,
        };
      })
    );
  };

  const updateFeaturePrice = (agentId: string, featureId: string, field: 'baseCost' | 'basePrice', value: number) => {
    onAgentsChange(
      selectedAgents.map(agent => {
        if (agent.id !== agentId) return agent;
        
        const updatedFeatures = agent.features.map(f =>
          f.id === featureId ? { ...f, [field]: value } : f
        );

        const totalCost = updatedFeatures.reduce((sum, f) => sum + f.baseCost, 0);
        const totalPrice = updatedFeatures.reduce((sum, f) => sum + f.basePrice, 0);

        return {
          ...agent,
          features: updatedFeatures,
          customCost: totalCost,
          customPrice: totalPrice,
        };
      })
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Agregar Agente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => addAgent(template)}
              className="glass p-4 rounded-lg text-left hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{template.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(template.basePrice)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Agents */}
      {selectedAgents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Agentes Seleccionados</h3>
          
          {selectedAgents.map(agent => (
            <div 
              key={agent.id} 
              className="glass rounded-xl overflow-hidden"
            >
              {/* Agent Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {agent.features.length} características
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateAgentQuantity(agent.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{agent.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateAgentQuantity(agent.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right" onClick={e => e.stopPropagation()}>
                      <p className="text-xs text-muted-foreground">Precio</p>
                      <Input
                        type="number"
                        value={agent.customPrice}
                        onChange={e => updateAgentPrice(agent.id, 'customPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 h-8 text-right text-sm"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAgent(agent.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Features */}
              {expandedAgent === agent.id && (
                <div className="border-t border-border/50 p-4 bg-secondary/20 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {defaultAgentFeatures.map(feature => {
                      const agentFeature = agent.features.find(f => f.id === feature.id);
                      const isSelected = !!agentFeature;

                      return (
                        <div
                          key={feature.id}
                          className={cn(
                            "p-3 rounded-lg border transition-all duration-200",
                            isSelected 
                              ? "border-primary/50 bg-primary/5" 
                              : "border-border/50 bg-card/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleFeature(agent.id, feature)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">{feature.name}</p>
                              <p className="text-xs text-muted-foreground">{feature.description}</p>
                              
                              {isSelected && agentFeature && (
                                <div className="flex gap-2 mt-2">
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">Costo</label>
                                    <Input
                                      type="number"
                                      value={agentFeature.baseCost}
                                      onChange={e => updateFeaturePrice(agent.id, feature.id, 'baseCost', parseFloat(e.target.value) || 0)}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">Precio</label>
                                    <Input
                                      type="number"
                                      value={agentFeature.basePrice}
                                      onChange={e => updateFeaturePrice(agent.id, feature.id, 'basePrice', parseFloat(e.target.value) || 0)}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
