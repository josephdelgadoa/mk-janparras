import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'editor' | 'viewer';
    avatar_url: string;
}

export const authService = {
    async login(identity: string, passwordPlain: string): Promise<{ user: User | null; error: string | null }> {
        try {
            // 1. Fetch user by username or email
            // We use the RPC function 'get_user_by_identity' for security/efficiency if available,
            // otherwise falling back to direct query (less specific but works if RLS allows reading users)

            // Try RPC first
            let { data: users, error } = await supabase.rpc('get_user_by_identity', { identity });

            if (error) {
                // If RPC fails (e.g. not created yet), try direct query
                // Note: Index on username/email needed for perf
                const { data: directUsers, error: directError } = await supabase
                    .from('vv_users')
                    .select('*')
                    .or(`username.eq.${identity},email.eq.${identity}`)
                    .limit(1);

                if (directError) throw directError;
                users = directUsers;
            }

            if (!users || users.length === 0) {
                return { user: null, error: 'User not found' };
            }

            const user = users[0];

            // 2. Check Active Status
            if (!user.is_active) {
                return { user: null, error: 'Account is disabled.' };
            }

            // 3. Verify Password
            const match = await bcrypt.compare(passwordPlain, user.password_hash);
            if (!match) {
                return { user: null, error: 'Invalid password' };
            }

            // 4. Update Last Login (Fire and forget)
            supabase.from('vv_users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id).then();

            // 5. Return Clean User Object (No password_hash)
            const cleanUser: User = {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                avatar_url: user.avatar_url
            };

            // 6. Set Session (Simple LocalStorage for MVP, HTTP Cookie preferred for Prod)
            // Ideally we'd use Supabase Auth or a backend JWT here.
            // For now, we store the user object.
            localStorage.setItem('vv_user', JSON.stringify(cleanUser));

            return { user: cleanUser, error: null };

        } catch (err: any) {
            console.error('Login error:', err);
            return { user: null, error: err.message || 'Login failed' };
        }
    },

    logout() {
        localStorage.removeItem('vv_user');
        window.location.href = '/login';
    },

    getCurrentUser(): User | null {
        const stored = localStorage.getItem('vv_user');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
};
