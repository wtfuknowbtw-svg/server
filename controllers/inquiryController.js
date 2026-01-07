const supabase = require('../config/supabaseClient');

const MOCK_INQUIRIES = [
    { id: 1, name: "Sarah Williams", email: "sarah@tech.com", service: "Web Development", message: "Need a new website.", date: "2023-10-25" },
    { id: 2, name: "Michael Chen", email: "m.chen@ai.corp", service: "AI Integration", message: "Integrating GPT-4.", date: "2023-10-24" },
    { id: 3, name: "Emma Davis", email: "emma@startup.io", service: "Mobile App", message: "Flutter app needed.", date: "2023-10-23" }
];

const getInquiries = async (req, res) => {
    try {
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json(data);
        }

        // Mock Fallback
        console.log('⚠️  Using MOCK DATA for Inquiries');
        res.status(200).json(MOCK_INQUIRIES);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createInquiry = async (req, res) => {
    const { name, email, service, message } = req.body;

    try {
        // 1. Save to Supabase if configured
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        let savedData = { name, email, service, message, created_at: new Date() };

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            const { data, error } = await supabase.from('inquiries').insert([
                { name, email, service, message }
            ]).select();

            if (error) {
                console.error('Supabase Insert Error:', error.message);
                // Return error to frontend so user knows it failed
                return res.status(500).json({ error: `Database Error: ${error.message}` });
            }
            savedData = data[0];
        } else {
            console.log('📝 Mock: Saved inquiry to local memory');
            MOCK_INQUIRIES.unshift({ id: Date.now(), ...savedData });
        }

        // 2. Forward to Google Sheets if Webhook URL provided
        if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
            fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    name,
                    email,
                    service,
                    message
                })
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Successfully forwarded to Google Sheets');
                } else {
                    console.error('❌ Google Sheets Webhook returned status:', response.status);
                }
            }).catch(gsError => {
                console.error('❌ Google Sheets Background Error:', gsError.message);
            });
        }

        res.status(201).json({ message: 'Inquiry received successfully', data: savedData });

    } catch (error) {
        console.error('Create Inquiry Error:', error);
        res.status(500).json({ error: 'Failed to process inquiry' });
    }
};

module.exports = { getInquiries, createInquiry };
