const supabase = require('../config/supabaseClient');

const getStats = async (req, res) => {
    try {
        const isConfigured = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

        // Default Stats (Mock)
        let stats = {
            totalInquiries: 0,
            activeProjects: 5, // Mock number for now as we don't have a projects table yet
            pendingTasks: 3,
            revenue: '$12,500'
        };

        if (isConfigured && !process.env.SUPABASE_URL.includes('your-project-url')) {
            // Fetch real counts
            const { count: inquiryCount, error: inquiryError } = await supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true });

            if (!inquiryError) {
                stats.totalInquiries = inquiryCount;
            }

            // You can add booking counts or other tables here
            const { count: bookingCount, error: bookingError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true });

            // Simply adding bookings to active projects count for demonstration
            if (!bookingError) {
                stats.activeProjects += bookingCount;
            }
        } else {
            // If mocking, return some realistic defaults so the UI looks good
            stats.totalInquiries = 12;
            stats.activeProjects = 8;
        }

        res.status(200).json(stats);

    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

module.exports = { getStats };
