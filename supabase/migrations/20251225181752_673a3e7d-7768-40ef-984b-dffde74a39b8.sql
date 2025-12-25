-- Add discount column to quotations table
ALTER TABLE public.quotations 
ADD COLUMN discount numeric NOT NULL DEFAULT 0;