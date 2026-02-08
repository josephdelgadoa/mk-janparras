import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

// Create client (using anon key is fine if RLS allows insert, or use Service Role if RLS is strict)
// For seeding, usually Service Role key is better to bypass RLS, but we'll try standard first
// If this fails due to RLS, user needs to provide VITE_SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_USERS = [
    {
        username: 'robin.manoogian',
        email: 'robin@vallartavows.com',
        first_name: 'Robin',
        last_name: 'Manoogian',
        role: 'admin',
        env_pass_key: 'ROBIN_INITIAL_PASSWORD',
        default_pass: 'tempPass123!' // Fallback ONLY if env var missing, warn heavily
    },
    {
        username: 'joseph.delgado',
        email: 'joseph@josephndelgado.com',
        first_name: 'Joseph',
        last_name: 'Delgado',
        role: 'admin',
        env_pass_key: 'JOSEPH_INITIAL_PASSWORD',
        default_pass: 'tempPass123!'
    }
];

async function seed() {
    console.log('🌱 Seeding Users...');

    for (const u of SEED_USERS) {
        const plainPass = process.env[u.env_pass_key] || u.default_pass;

        if (plainPass === u.default_pass) {
            console.warn(`⚠️  Warning: Using default password for ${u.username}. Set ${u.env_pass_key} in .env for security.`);
        }

        console.log(`Hashing password for ${u.username}...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainPass, salt);

        const { error } = await supabase
            .from('vv_users')
            .upsert({
                username: u.username,
                email: u.email,
                first_name: u.first_name,
                last_name: u.last_name,
                role: u.role,
                password_hash: hash,
                avatar_url: '',
                is_active: true
            }, { onConflict: 'username' });

        if (error) {
            console.error(`❌ Failed to seed ${u.username}:`, error.message);
        } else {
            console.log(`✅ Seeded ${u.username}`);
        }
    }
}

seed();
