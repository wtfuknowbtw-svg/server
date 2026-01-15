const supabase = require('../config/supabaseClient');

// Mock User for "Do it yourself" immediate access
// Mock User for "Do it yourself" immediate access
const MOCK_USER = {
    id: 'user_123',
    email: 'admin@sutratech.com',
    role: 'admin'
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Dev/Mock Admin Bypass (Checks this FIRST)
    // This allows login even if Supabase is not fully configured or keys are invalid
    if (email === 'admin@sutratech.com' && password === 'admin') {
        console.log('✅ Login: Using Dev Admin Bypass');
        return res.status(200).json({
            user: MOCK_USER,
            token: 'mock_jwt_token_12345',
            isMock: true
        });
    }

    try {
        // 2. Try Real Supabase Auth
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return res.status(200).json({ user: data.user, token: data.session.access_token });
        }

        // 3. Fallback (if Supabase not configured and not admin user)
        console.log('⚠️  Using MOCK AUTH (No Supabase Keys found)');

        // Return 401 if we got here but didn't match anything
        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};

module.exports = { login };
