-- Create prompts table for storing user prompts with version tracking
CREATE TABLE IF NOT EXISTS prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  original_input text NOT NULL,
  generated_prompt text NOT NULL,
  laziness_level text CHECK (laziness_level IN ('super_duper', 'regular')),
  questions_data jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT unique_parent_version UNIQUE(parent_id, version)
);

-- Create indexes for efficient queries
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_parent_id ON prompts(parent_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own prompts
CREATE POLICY "Users can view own prompts" 
  ON prompts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only create prompts for themselves
CREATE POLICY "Users can create own prompts" 
  ON prompts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own prompts
CREATE POLICY "Users can update own prompts" 
  ON prompts 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own prompts
CREATE POLICY "Users can delete own prompts" 
  ON prompts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at column
CREATE TRIGGER update_prompts_updated_at 
  BEFORE UPDATE ON prompts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get the next version number for a prompt
CREATE OR REPLACE FUNCTION get_next_version(p_parent_id uuid)
RETURNS integer AS $$
DECLARE
  max_version integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 
  INTO max_version
  FROM prompts 
  WHERE parent_id = p_parent_id OR (id = p_parent_id AND parent_id IS NULL);
  
  RETURN max_version;
END;
$$ LANGUAGE plpgsql;

-- View to get the latest version of each prompt family
CREATE OR REPLACE VIEW latest_prompts AS
SELECT DISTINCT ON (COALESCE(parent_id, id)) 
  p.*,
  COUNT(*) OVER (PARTITION BY COALESCE(parent_id, id)) as total_versions
FROM prompts p
ORDER BY COALESCE(parent_id, id), version DESC;