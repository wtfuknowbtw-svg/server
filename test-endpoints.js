
async function testBooking() {
    console.log('Testing Booking Endpoint...');
    try {
        const response = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                solution: 'ai-automation',
                industry: 'tech',
                timeSlot: '2026-01-20 10:00 AM',
                userDetails: {
                    name: 'Test Setup',
                    email: 'test@sutratech.ai',
                    company: 'Sutratech Internal',
                    phone: '1234567890',
                    useCase: 'Debugging submission errors'
                }
            })
        });

        // Try to parse JSON, if fails, get text
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log('Booking Status:', response.status);
        console.log('Booking Response:', data);
    } catch (error) {
        console.error('Booking Test Failed:', error.message);
    }
}

async function testInquiry() {
    console.log('\nTesting Inquiry Endpoint...');
    try {
        const response = await fetch('http://localhost:5000/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Inquiry',
                email: 'inquiry@sutratech.ai',
                service: 'General Query',
                message: 'Testing inquiry submission'
            })
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log('Inquiry Status:', response.status);
        console.log('Inquiry Response:', data);
    } catch (error) {
        console.error('Inquiry Test Failed:', error.message);
    }
}

async function run() {
    await testBooking();
    await testInquiry();
}

run();
