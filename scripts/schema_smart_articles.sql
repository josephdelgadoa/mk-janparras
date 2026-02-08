-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

----------------------------------------
-- 1) vv_authors
----------------------------------------
create table if not exists vv_authors (
    id uuid primary key default uuid_generate_v4(),
    display_name text not null,
    email text unique not null,
    bio text,
    avatar_url text,
    created_at timestamptz default now()
);

----------------------------------------
-- 2) vv_categories
----------------------------------------
create table if not exists vv_categories (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    slug text unique not null,
    description text,
    created_at timestamptz default now()
);

----------------------------------------
-- 3) vv_tags
----------------------------------------
create table if not exists vv_tags (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    slug text unique not null,
    created_at timestamptz default now()
);

----------------------------------------
-- 4) vv_articles (WordPress-style posts)
----------------------------------------
create table if not exists vv_articles (
    id uuid primary key default uuid_generate_v4(),
    
    -- Core Content
    title text not null,
    slug text unique not null,
    short_description text,
    excerpt text,
    content_md text,
    content_html text,
    status text default 'draft' check (status in ('draft', 'published', 'archived')),
    
    -- Relations
    author_id uuid references vv_authors(id),
    primary_category_id uuid references vv_categories(id),
    secondary_category_id uuid references vv_categories(id),
    
    -- Timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    published_at timestamptz,
    
    -- Metadata
    language text default 'en',
    location_target text,
    reading_time_minutes int,
    word_count int,
    
    -- SEO / GEO
    seo_title text,
    meta_description text,
    focus_keyword text,
    canonical_url text,
    og_title text,
    og_description text,
    og_image_url text,
    schema_json jsonb,
    internal_links_json jsonb,
    external_links_json jsonb,
    
    -- Featured Image (Prompts mostly)
    featured_image_prompt text,
    featured_image_alt text,
    featured_image_style text,
    
    -- Social
    hashtags text[],
    
    -- WordPress Sync
    wp_post_id bigint,
    wp_status text default 'not_published' check (wp_status in ('not_published', 'queued', 'publishing', 'published', 'failed')),
    wp_permalink text,
    wp_featured_media_id bigint,
    wp_sync_hash text,
    wp_last_published_at timestamptz,
    wp_last_error text,
    wp_payload_json jsonb,
    wp_payload_version int default 1
);

----------------------------------------
-- 5) vv_article_tags (Many-to-Many)
----------------------------------------
create table if not exists vv_article_tags (
    article_id uuid references vv_articles(id) on delete cascade,
    tag_id uuid references vv_tags(id) on delete cascade,
    primary key (article_id, tag_id)
);

----------------------------------------
-- 6) vv_wp_publish_queue
----------------------------------------
create table if not exists vv_wp_publish_queue (
    id uuid primary key default uuid_generate_v4(),
    article_id uuid references vv_articles(id) on delete cascade,
    action text check (action in ('create', 'update')),
    scheduled_at timestamptz default now(),
    attempts int default 0,
    last_attempt_at timestamptz,
    status text default 'queued' check (status in ('queued', 'processing', 'done', 'failed')),
    last_error text,
    created_at timestamptz default now()
);

----------------------------------------
-- Indexes
----------------------------------------
create index if not exists idx_articles_slug on vv_articles(slug);
create index if not exists idx_articles_status on vv_articles(status);
create index if not exists idx_articles_published_at on vv_articles(published_at);
create index if not exists idx_articles_primary_category on vv_articles(primary_category_id);
create index if not exists idx_articles_wp_post_id on vv_articles(wp_post_id);
create index if not exists idx_articles_wp_status on vv_articles(wp_status);

create index if not exists idx_queue_status on vv_wp_publish_queue(status);
create index if not exists idx_queue_scheduled_at on vv_wp_publish_queue(scheduled_at);

----------------------------------------
-- Trigger for updated_at
----------------------------------------
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_article_modtime
    before update on vv_articles
    for each row
    execute function update_modified_column();
