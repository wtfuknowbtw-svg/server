const supabase = require('../config/supabaseClient');

// Mock User for "Do it yourself" immediate access
const MOCK_USER = {
    id: 'user_123',
    email: 'admin@cortexaa.com',
    role: 'admin'
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // 1. Try Real Supabase Auth first
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return res.status(200).json({ user: data.user, token: data.session.access_token });
        }

        // 2. Fallback to Mock Mode (if no keys)
        console.log('⚠️  Using MOCK AUTH (No Supabase Keys found)');

        if (email === 'admin@cortexaa.com' && password === 'admin') {
            // Return a fake token
            return res.status(200).json({
                user: MOCK_USER,
                token: 'mock_jwt_token_12345',
                isMock: true
            });
        } else {
            return res.status(401).json({ error: 'Invalid mock credentials' });
        }

    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};

module.exports = { login };
