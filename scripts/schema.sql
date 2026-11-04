-- =============================================================================
-- UMCO Pharmaceutical Industries - Enterprise Relational Database Schema
-- Modules: Advanced Classification, Custom Collections, RBAC & Audit Trails
-- Standard: PostgreSQL 15+ / Supabase Relational Architecture with RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Profiles & RBAC (Role-Based Access Control)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    badge_color VARCHAR(100) DEFAULT 'bg-slate-100 text-slate-800',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    key VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    label_en VARCHAR(150) NOT NULL,
    label_ar VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_ar TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) REFERENCES public.permissions(key) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    role_id VARCHAR(50) REFERENCES public.roles(id) DEFAULT 'viewer',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'pending')),
    department VARCHAR(100),
    avatar_url TEXT,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_custom_permissions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) REFERENCES public.permissions(key) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_key)
);

-- -----------------------------------------------------------------------------
-- 2. Advanced Product Classification
-- -----------------------------------------------------------------------------

-- Hierarchical Tree Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50) REFERENCES public.categories(id) ON DELETE SET NULL,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(30) DEFAULT '#0284c7',
    sort_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Pharmaceutical Ingredients (APIs)
CREATE TABLE IF NOT EXISTS public.ingredients (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    default_strength VARCHAR(50),
    unit VARCHAR(20) DEFAULT '%',
    cas_number VARCHAR(50),
    is_combination BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Therapeutic Classification
CREATE TABLE IF NOT EXISTS public.therapeutic_uses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(50) DEFAULT 'shield',
    color VARCHAR(30) DEFAULT '#0284c7',
    parent_id VARCHAR(50) REFERENCES public.therapeutic_uses(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosage Forms
CREATE TABLE IF NOT EXISTS public.dosage_forms (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    route_en VARCHAR(80),
    route_ar VARCHAR(80),
    icon VARCHAR(50) DEFAULT 'feather',
    is_custom BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Core Pharmaceutical Products Table
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(60) PRIMARY KEY,
    sku VARCHAR(60) UNIQUE NOT NULL,
    priority INT NOT NULL,
    trade_name_en VARCHAR(200) NOT NULL,
    trade_name_ar VARCHAR(200) NOT NULL,
    scientific_name TEXT,
    category_en VARCHAR(100),
    category_ar VARCHAR(100),
    dosage_form_en VARCHAR(80),
    dosage_form_ar VARCHAR(80),
    dosage_form_id VARCHAR(50) REFERENCES public.dosage_forms(id) ON DELETE SET NULL,
    category_id VARCHAR(50) REFERENCES public.categories(id) ON DELETE SET NULL,
    concentration VARCHAR(80),
    package_size VARCHAR(120),
    indications_en TEXT,
    indications_ar TEXT,
    usage_en TEXT,
    usage_ar TEXT,
    storage_en TEXT,
    storage_ar TEXT,
    image_url TEXT,
    additional_images TEXT[],
    status VARCHAR(50) DEFAULT 'Active',
    price NUMERIC(12, 2),
    price_formatted VARCHAR(60),
    price_raw VARCHAR(80),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_priority ON public.products(priority ASC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Product <-> Ingredients Junction (Many-to-Many with strength)
CREATE TABLE IF NOT EXISTS public.product_ingredients (
    product_id VARCHAR(60) REFERENCES public.products(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(50) REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    strength VARCHAR(50),
    unit VARCHAR(20),
    is_primary BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (product_id, ingredient_id)
);

-- Product <-> Therapeutic Uses Junction (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.product_therapeutic_uses (
    product_id VARCHAR(60) REFERENCES public.products(id) ON DELETE CASCADE,
    therapeutic_use_id VARCHAR(50) REFERENCES public.therapeutic_uses(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, therapeutic_use_id)
);

-- -----------------------------------------------------------------------------
-- 4. Custom Collections & Independent Priority Lists
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.collections (
    id VARCHAR(60) PRIMARY KEY,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    color VARCHAR(30) DEFAULT '#dc2626',
    icon VARCHAR(50) DEFAULT 'folder',
    image_url TEXT,
    manager VARCHAR(120),
    visibility VARCHAR(30) DEFAULT 'public' CHECK (visibility IN ('public', 'internal', 'restricted')),
    type VARCHAR(30) DEFAULT 'manual' CHECK (type IN ('manual', 'smart', 'classification')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    smart_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_products (
    collection_id VARCHAR(60) REFERENCES public.collections(id) ON DELETE CASCADE,
    product_id VARCHAR(60) REFERENCES public.products(id) ON DELETE CASCADE,
    priority INT NOT NULL, -- Independent collection ordering sequence
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_priority ON public.collection_products(collection_id, priority ASC);

-- -----------------------------------------------------------------------------
-- 5. Audit Logging Table
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    product_id VARCHAR(60),
    product_name VARCHAR(200),
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- -----------------------------------------------------------------------------
-- 6. Row-Level Security (RLS) Configuration
-- -----------------------------------------------------------------------------

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapeutic_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated staff
CREATE POLICY "Allow authenticated users to view products" ON public.products
    FOR SELECT TO authenticated USING (is_deleted = FALSE);

CREATE POLICY "Allow editors and admins to modify products" ON public.products
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id IN ('super_admin', 'product_manager', 'editor')
        )
    );

-- Audit logs are append-only; ordinary users cannot modify or delete
CREATE POLICY "Allow view audit logs for authorized staff" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role_id IN ('super_admin', 'product_manager')
        )
    );

CREATE POLICY "Allow system to insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (TRUE);
