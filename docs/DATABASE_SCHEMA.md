# Database Schema Documentation

This document describes the Supabase database schema for the ClawProxy platform.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands below to create the database schema

## Tables

### Clients Table

Stores client information and authentication data.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Projects Table

Stores project information and status.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('rapid', 'full', 'ai-integration', 'design')),
  status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'active', 'review', 'completed', 'cancelled')),
  budget INTEGER NOT NULL,
  start_date DATE,
  delivery_date DATE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks Table

Stores individual tasks within projects (Kanban board items).

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  assigned_to TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Messages Table

Stores communication between clients and team.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'team')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Files Table

Stores file metadata (actual files stored in Supabase Storage).

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_by_type TEXT NOT NULL CHECK (uploaded_by_type IN ('client', 'team')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Payments Table

Stores payment information and Stripe integration.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

## RLS Policies

### Clients Policies

```sql
-- Clients can view their own data
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (auth.uid() = id);

-- Clients can update their own data
CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (auth.uid() = id);
```

### Projects Policies

```sql
-- Clients can view their own projects
CREATE POLICY "Clients can view own projects" ON projects
  FOR SELECT USING (client_id = auth.uid());

-- Clients can create projects (from onboarding)
CREATE POLICY "Clients can create projects" ON projects
  FOR INSERT WITH CHECK (client_id = auth.uid());
```

### Tasks Policies

```sql
-- Clients can view tasks for their projects
CREATE POLICY "Clients can view project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );
```

### Messages Policies

```sql
-- Clients can view messages for their projects
CREATE POLICY "Clients can view project messages" ON messages
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );

-- Clients can create messages
CREATE POLICY "Clients can create messages" ON messages
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
    AND sender_type = 'client'
  );
```

### Files Policies

```sql
-- Clients can view files for their projects
CREATE POLICY "Clients can view project files" ON files
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );

-- Clients can upload files
CREATE POLICY "Clients can upload files" ON files
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
    AND uploaded_by_type = 'client'
  );
```

### Payments Policies

```sql
-- Clients can view payments for their projects
CREATE POLICY "Clients can view project payments" ON payments
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE client_id = auth.uid())
  );
```

## Storage Buckets

Create a storage bucket for project files:

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `project-files`
3. Set it to private
4. Add RLS policies:

```sql
-- Allow clients to upload files to their project folders
CREATE POLICY "Clients can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE client_id = auth.uid()
  )
);

-- Allow clients to view files in their project folders
CREATE POLICY "Clients can view project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects WHERE client_id = auth.uid()
  )
);
```

## Indexes

Add indexes for better performance:

```sql
-- Projects indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Tasks indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Messages indexes
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Files indexes
CREATE INDEX idx_files_project_id ON files(project_id);

-- Payments indexes
CREATE INDEX idx_payments_project_id ON payments(project_id);
```

## Triggers

Auto-update `updated_at` timestamp:

```sql
-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to clients table
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to projects table
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to tasks table
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Setup Complete!

After running all these commands, your database will be ready for the ClawProxy platform.

## Next Steps

1. Configure environment variables in `.env.local`
2. Test authentication flow
3. Test project creation
4. Implement file upload functionality
5. Add Stripe payment integration
