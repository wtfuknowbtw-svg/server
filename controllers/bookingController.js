const supabase = require('../config/supabaseClient');

const createBooking = async (req, res) => {
    const { solution, industry, timeSlot, userDetails } = req.body;
    const { name, email, company, phone, useCase } = userDetails;

    try {
        // 1. Save to Supabase if configured (optional but good for records)
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        let savedData = { solution, industry, timeSlot, ...userDetails, created_at: new Date() };

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            try {
                const { data, error } = await supabase.from('bookings').insert([
                    { solution, industry, time_slot: timeSlot, name, email, company, phone, use_case: useCase }
                ]).select();

                if (error) {
                    console.error('Supabase Booking Insert Error:', error.message);
                    // We continue even if supabase fails because Google Sheets is the primary requirement
                } else if (data) {
                    savedData = data[0];
                }
            } catch (err) {
                console.error('Supabase connection error:', err.message);
            }
        }

        // 2. Forward to Google Sheets if Webhook URL provided
        if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
            // Forward in background to prevent UI hang
            fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
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
            }).then(() => {
                console.log('✅ Booking forwarded to Google Sheets');
            }).catch(err => {
                console.error('❌ Google Sheets Forwarding Error:', err.message);
            });
        }

        res.status(201).json({
            success: true,
            message: 'Booking successfully synchronized',
            data: savedData
        });

    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ success: false, error: 'Failed to process booking protocol' });
    }
};

module.exports = { createBooking };
