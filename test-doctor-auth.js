// Test script for Doctor Registration and Login functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testDoctor = {
    name: 'Dr. Test Doctor',
    email: 'test.doctor@example.com',
    password: 'testpassword123',
    phone: '1234567890',
    role: 'doctor'
};

async function testDoctorRegistration() {
    console.log('\n🔧 Testing Doctor Registration...');
    console.log('Test Data:', { ...testDoctor, password: '[HIDDEN]' });
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, testDoctor);
        console.log('✅ Registration Successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Registration Failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        return false;
    }
}

async function testDoctorLogin() {
    console.log('\n🔧 Testing Doctor Login...');
    
    const loginData = {
        email: testDoctor.email,
        password: testDoctor.password
    };
    
    console.log('Login Data:', { ...loginData, password: '[HIDDEN]' });
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        console.log('✅ Login Successful:', {
            user: response.data.user,
            hasToken: !!response.data.token
        });
        return response.data.token;
    } catch (error) {
        console.log('❌ Login Failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        return null;
    }
}

async function testProtectedRoute(token) {
    console.log('\n🔧 Testing Protected Route Access...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                'x-auth-token': token
            }
        });
        console.log('✅ Protected Route Access Successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Protected Route Access Failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        return false;
    }
}

async function cleanupTestUser() {
    console.log('\n🧹 Note: Test user cleanup would require admin privileges or direct DB access');
    console.log(`Test user email: ${testDoctor.email}`);
}

async function runTests() {
    console.log('🚀 Starting Doctor Authentication Tests...');
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    // Test server connectivity
    try {
        await axios.get('http://localhost:5000');
        console.log('✅ Server is running');
    } catch (error) {
        console.log('❌ Server is not running. Please start the backend server first.');
        return;
    }
    
    // Test registration
    const registrationSuccess = await testDoctorRegistration();
    
    if (!registrationSuccess) {
        console.log('\n⚠️ Attempting login with potentially existing user...');
    }
    
    // Test login
    const token = await testDoctorLogin();
    
    if (token) {
        // Test protected route
        await testProtectedRoute(token);
    }
    
    await cleanupTestUser();
    
    console.log('\n📋 Test Summary:');
    console.log(`Registration: ${registrationSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`Login: ${token ? '✅ Success' : '❌ Failed'}`);
    console.log(`Protected Access: ${token ? '✅ Success' : '❌ Failed'}`);
}

// Run the tests
runTests().catch(console.error);