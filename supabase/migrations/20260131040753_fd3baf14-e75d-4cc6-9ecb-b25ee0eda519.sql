-- Create study_sessions table for tracking all study activities
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  goal TEXT,
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries by date
CREATE INDEX idx_study_sessions_date ON public.study_sessions(study_date DESC);

-- Create index for subject lookups
CREATE INDEX idx_study_sessions_subject ON public.study_sessions(subject);

-- Create pomodoro_sessions table for focus mode tracking
CREATE TABLE public.pomodoro_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  study_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create index for pomodoro queries by date
CREATE INDEX idx_pomodoro_sessions_date ON public.pomodoro_sessions(study_date DESC);

-- Enable Row Level Security (allowing public access for this demo - no auth)
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies allowing all operations (demo mode without auth)
CREATE POLICY "Allow all study session operations" 
ON public.study_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all pomodoro session operations" 
ON public.pomodoro_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);