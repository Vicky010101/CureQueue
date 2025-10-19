// Simple test script to check if backend is running and accessible
const axios = require('axios');

async function testConnection() {
    console.log('Testing backend connection...');
    
    try {
        // Test basic server connection
        const response = await axios.get('http://localhost:5000');
        console.log('✅ Backend server is running:', response.data);
        
        // Test API routes
        try {
            const apiResponse = await axios.get('http://localhost:5000/api');
            console.log('✅ API routes accessible');
        } catch (apiError) {
            console.log('⚠️  API routes not accessible:', apiError.message);
        }
        
    } catch (error) {
        console.log('❌ Backend server is not running or not accessible:', error.message);
        console.log('Make sure to start the backend server with: npm start or node server.js');
    }
}

testConnection();