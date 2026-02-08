----------------------------------------
-- Seed Authors
----------------------------------------
insert into vv_authors (display_name, email, bio, avatar_url)
values (
    'Vallarta Vows Editorial Team',
    'info@vallartavows.com',
    'Planning destination weddings in Puerto Vallarta with curated venues, trusted vendors, and stress-free coordination.',
    'https://vallartavows.com/wp-content/uploads/2024/01/vv-author-avatar.jpg' -- Placeholder
) on conflict (email) do nothing;

----------------------------------------
-- Seed Categories
----------------------------------------
insert into vv_categories (name, slug, description)
values
    ('Puerto Vallarta Wedding Planning', 'puerto-vallarta-wedding-planning', 'Expert guides for planning your dream wedding in Puerto Vallarta.'),
    ('All-Inclusive Wedding Packages', 'all-inclusive-wedding-packages', 'Comprehensive packages covering venues, catering, and more.'),
    ('Legal & Civil Weddings in Mexico', 'legal-civil-weddings-mexico', 'Navigating the legal requirements for civil ceremonies in Mexico.'),
    ('Venues & Beach Locations', 'venues-beach-locations', 'The most stunning beaches, resorts, and private villas in PV.'),
    ('Budget-Friendly Destination Weddings', 'budget-friendly-destination-weddings', 'Tips and strategies for a beautiful wedding that fits your budget.')
on conflict (slug) do nothing;

----------------------------------------
-- Seed Tags (Initial Set)
----------------------------------------
insert into vv_tags (name, slug)
values
    ('Destination Wedding', 'destination-wedding'),
    ('Puerto Vallarta', 'puerto-vallarta'),
    ('Beach Wedding', 'beach-wedding'),
    ('Wedding Planning', 'wedding-planning'),
    ('Mexico Wedding', 'mexico-wedding'),
    ('All Inclusive', 'all-inclusive'),
    ('Legal Requirements', 'legal-requirements'),
    ('Budget Tips', 'budget-tips'),
    ('Wedding Venues', 'wedding-venues'),
    ('Elopement', 'elopement'),
    ('Micro Wedding', 'micro-wedding'),
    ('Sunset Wedding', 'sunset-wedding')
on conflict (slug) do nothing;
