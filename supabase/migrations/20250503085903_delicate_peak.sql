-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer not to say')),
  date_of_birth DATE,
  nationality VARCHAR(100),
  settlement_site VARCHAR(50) CHECK (settlement_site IN ('Rwamwanja', 'Kyangwali', 'Nakivale', 'Other', 'None')),
  refugee_id VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  preferred_language VARCHAR(20) DEFAULT 'english' CHECK (preferred_language IN ('english', 'swahili', 'french', 'arabic', 'runyankole')),
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted')),
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  program VARCHAR(100),
  department VARCHAR(100),
  academic_year VARCHAR(20),
  semester VARCHAR(20),
  disability_status BOOLEAN DEFAULT false,
  disability_type VARCHAR(100),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create education_records table
CREATE TABLE IF NOT EXISTS education_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  institution_name VARCHAR(255) NOT NULL,
  institution_type VARCHAR(50) CHECK (institution_type IN ('high_school', 'college', 'university', 'vocational', 'other')),
  country VARCHAR(100),
  city VARCHAR(100),
  degree VARCHAR(100),
  field_of_study VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_currently_studying BOOLEAN DEFAULT false,
  grade VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('transcript', 'certificate', 'identification', 'recommendation', 'other')),
  institution VARCHAR(255),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('email', 'sms', 'in_app')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_to UUID,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_settlement_site ON users(settlement_site);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_education_records_application_id ON education_records(application_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update timestamp triggers
CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_roles_timestamp
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_applications_timestamp
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_education_records_timestamp
  BEFORE UPDATE ON education_records
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_documents_timestamp
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_notifications_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('reviewer', 'Application reviewer with limited admin access'),
  ('applicant', 'Student applicant')
ON CONFLICT (name) DO NOTHING;

-- Create full-text search indexes
ALTER TABLE applications ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS applications_search_idx ON applications USING gin(search_vector);

CREATE OR REPLACE FUNCTION applications_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.application_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.program, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.department, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.comments, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_search_update
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION applications_search_trigger();