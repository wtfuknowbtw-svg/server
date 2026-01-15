const supabase = require('../config/supabaseClient');

const getInquiries = async (req, res) => {
    try {
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json(data);
        }

        // Return empty array if not configured
        return res.status(200).json([]);

    } catch (error) {
        console.error('Get Inquiries Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const createInquiry = async (req, res) => {
    try {
        const { name, email, service, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required fields.' });
        }

        // 1. Save to Supabase if configured
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        let savedData = null;

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            if (supabase) {
                try {
                    const { data, error } = await supabase.from('inquiries').insert([
                        { name, email, service, message }
                    ]).select();

                    if (error) {
                        console.error('Supabase Insert Error:', error.message);
                    } else if (data) {
                        savedData = data[0];
                    }
                } catch (err) {
                    console.error('Supabase connection error:', err.message);
                }
            } else {
                console.warn('Supabase configuration detected but client is null. Check supabaseClient.js');
            }
        }

        // 2. Forward to Google Sheets if Webhook URL provided
        if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
            try {
                // Ensure fetch is available
                const fetchFn = global.fetch || require('node-fetch');
                const response = await fetchFn(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'INQUIRY_FORM', // Added type for clarity
                        timestamp: new Date().toISOString(),
                        name,
                        email,
                        service,
                        message
                    })
                });

                if (response.ok) {
                    console.log('✅ Successfully forwarded to Google Sheets');
                } else {
                    const text = await response.text();
                    console.error('❌ Google Sheets Webhook returned error:', response.status, text);
                }
            } catch (gsError) {
                console.error('❌ Google Sheets Background Error:', gsError.message);
            }
        }

        res.status(201).json({ message: 'Inquiry received successfully', data: savedData });

    } catch (error) {
        console.error('Create Inquiry Error Stack:', error);
        res.status(500).json({ error: error.message || 'Failed to process inquiry' });
    }
};

const deleteInquiry = async (req, res) => {
    const { id } = req.params;

    try {
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);

            if (error) {
                console.error('Supabase Delete Error:', error);
                throw error;
            }
            return res.status(200).json({ message: 'Inquiry deleted successfully' });
        }

        return res.status(404).json({ error: 'Database not configured, cannot delete' });

    } catch (error) {
        console.error('Delete Inquiry Error:', error);
        res.status(500).json({ error: 'Failed to delete inquiry' });
    }
};

module.exports = { getInquiries, createInquiry, deleteInquiry };
