-- Phase 1 Table Schemas for JSA Safety System

-- 1. 안전보건점검 (Safety Inspections)
CREATE TABLE public.safety_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    inspector TEXT NOT NULL,
    hq TEXT,
    dept TEXT,
    team TEXT,
    store TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 안전보건점검 개별 항목 (Safety Inspection Items)
CREATE TABLE public.safety_inspection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspection_id UUID REFERENCES public.safety_inspections(id) ON DELETE CASCADE,
    category TEXT,
    question TEXT,
    score INTEGER,
    judgment TEXT,
    remark TEXT,
    photo_url TEXT
);

-- 3. 사고원인조사 (Accident Investigations)
CREATE TABLE public.accident_investigations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    check_date DATE NOT NULL,
    inspector TEXT NOT NULL,
    store TEXT NOT NULL,
    hq TEXT,
    dept TEXT,
    team TEXT,
    accident_date DATE,
    accident_type TEXT,
    accident_content TEXT,
    agency TEXT,
    agency_photo TEXT,
    hazard TEXT,
    risk_grade TEXT,
    status TEXT,
    action_photo TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI 근골격계 (AI Muscle Analysis)
CREATE TABLE public.ai_muscle_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    inspector TEXT NOT NULL,
    store TEXT,
    hq TEXT,
    dept TEXT,
    team TEXT,
    task_name TEXT,
    total_score INTEGER,
    grade TEXT,
    full_text TEXT,
    image_url TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies (Optional/Allow All for MVP)
ALTER TABLE public.safety_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accident_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_muscle_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON public.safety_inspections FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.safety_inspections FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON public.safety_inspection_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.safety_inspection_items FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON public.accident_investigations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.accident_investigations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON public.ai_muscle_analysis FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.ai_muscle_analysis FOR INSERT TO anon WITH CHECK (true);
