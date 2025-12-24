-- Create enum for quotation status
CREATE TYPE public.quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');

-- Create agent_features table (base features catalog)
CREATE TABLE public.agent_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_editable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_templates table
CREATE TABLE public.agent_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template_features junction table
CREATE TABLE public.template_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.agent_templates(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.agent_features(id) ON DELETE CASCADE,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE(template_id, feature_id)
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  client_phone TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  implementation_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  implementation_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_maintenance_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_maintenance_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status quotation_status NOT NULL DEFAULT 'draft',
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_agents table
CREATE TABLE public.quotation_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  custom_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  custom_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_agent_features table
CREATE TABLE public.quotation_agent_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_agent_id UUID NOT NULL REFERENCES public.quotation_agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Enable Row Level Security on all tables
ALTER TABLE public.agent_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_agent_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_features
CREATE POLICY "Users can view their own features" ON public.agent_features
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own features" ON public.agent_features
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own features" ON public.agent_features
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own features" ON public.agent_features
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for agent_templates
CREATE POLICY "Users can view their own templates" ON public.agent_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.agent_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.agent_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.agent_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for template_features (via template ownership)
CREATE POLICY "Users can view template features" ON public.template_features
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agent_templates WHERE id = template_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create template features" ON public.template_features
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.agent_templates WHERE id = template_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update template features" ON public.template_features
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.agent_templates WHERE id = template_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete template features" ON public.template_features
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.agent_templates WHERE id = template_id AND user_id = auth.uid())
  );

-- RLS Policies for quotations
CREATE POLICY "Users can view their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quotations" ON public.quotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotations" ON public.quotations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotations" ON public.quotations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quotation_agents (via quotation ownership)
CREATE POLICY "Users can view quotation agents" ON public.quotation_agents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create quotation agents" ON public.quotation_agents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update quotation agents" ON public.quotation_agents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete quotation agents" ON public.quotation_agents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.quotations WHERE id = quotation_id AND user_id = auth.uid())
  );

-- RLS Policies for quotation_agent_features (via quotation_agent -> quotation ownership)
CREATE POLICY "Users can view quotation agent features" ON public.quotation_agent_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quotation_agents qa
      JOIN public.quotations q ON qa.quotation_id = q.id
      WHERE qa.id = quotation_agent_id AND q.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create quotation agent features" ON public.quotation_agent_features
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotation_agents qa
      JOIN public.quotations q ON qa.quotation_id = q.id
      WHERE qa.id = quotation_agent_id AND q.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update quotation agent features" ON public.quotation_agent_features
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.quotation_agents qa
      JOIN public.quotations q ON qa.quotation_id = q.id
      WHERE qa.id = quotation_agent_id AND q.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete quotation agent features" ON public.quotation_agent_features
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.quotation_agents qa
      JOIN public.quotations q ON qa.quotation_id = q.id
      WHERE qa.id = quotation_agent_id AND q.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agent_features_updated_at
  BEFORE UPDATE ON public.agent_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_templates_updated_at
  BEFORE UPDATE ON public.agent_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();