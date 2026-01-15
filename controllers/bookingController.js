const supabase = require('../config/supabaseClient');

const createBooking = async (req, res) => {
    try {
        const { solution, industry, timeSlot, userDetails } = req.body;

        // Input Validation
        if (!userDetails || !solution || !industry || !timeSlot) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: solution, industry, timeSlot, or userDetails'
            });
        }

        const { name, email, company, phone, useCase } = userDetails;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing user details: name and email are required'
            });
        }

        // 1. Save to Supabase if configured (optional but good for records)
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        let savedData = { solution, industry, timeSlot, ...userDetails, created_at: new Date() };

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            if (supabase) {
                try {
                    const { data, error } = await supabase.from('bookings').insert([
                        { solution, industry, time_slot: timeSlot, name, email, company, phone, use_case: useCase }
                    ]).select();

                    if (error) {
                        console.error('Supabase Booking Insert Error:', error.message);
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
                        type: 'BOOKING_SESSION',
                        timestamp: new Date().toLocaleString(),
                        customer_name: name,
                        customer_email: email,
                        customer_company: company,
                        customer_phone: phone,
                        selected_service: solution,
                        target_industry: industry,
                        scheduled_time: timeSlot,
                        additional_notes: useCase
                    })
                });

                if (response.ok) {
                    console.log('✅ Booking forwarded to Google Sheets');
                } else {
                    const text = await response.text();
                    console.error('❌ Google Sheets Webhook returned error:', response.status, text);
                }
            } catch (err) {
                console.error('❌ Google Sheets Forwarding Error:', err.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Booking successfully synchronized',
            data: savedData
        });

    } catch (error) {
        console.error('Create Booking Error Stack:', error);
        // Ensure we send a valid JSON even if error is complex
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process booking protocol'
        });
    }
};

module.exports = { createBooking };
