# CureQueue Healthcare App

A comprehensive healthcare management system with real-time queue management, appointment booking, and home visit requests.

Live Demo : https://cure-queue-cyan.vercel.app/



## 🚀 Features

### ✅ Admin Dashboard
- **Manual Waiting Time Control**: Admins can manually set or update patient waiting times
- **Real-time Updates**: Changes immediately reflect on Patient Dashboard
- **Home Visit Management**: Accept/reject home visit requests
- **Appointment Management**: View and manage all appointments
- **Queue Controls**: Publish live queue updates for patients

### ✅ Patient Dashboard
- **Enhanced Search**: Search for patients and doctors with detailed information
- **Real-time Queue Status**: Live updates on waiting times and queue position
- **Appointment Booking**: Book appointments with real-time slot availability
- **Home Visit Requests**: Submit and track home visit requests

### ✅ Appointment Integration
- **Automatic Sync**: Booked appointments appear on Admin Dashboard
- **Waiting Time Allocation**: Admins can assign waiting times to appointments
- **Real-time Updates**: Changes sync back to Patient Dashboard instantly

### ✅ Home Visit Flow
- **Request Submission**: Patients can submit home visit requests
- **Admin Review**: Requests appear on Admin Dashboard for review
- **Status Tracking**: Accept/reject functionality with status updates
- **Doctor Assignment**: Track doctor status and assignments

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/curequeue
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Seed the database with test users:
```bash
node seed.js
```

Start the backend server:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔐 Test Credentials

After running the seed script, you can use these test accounts:

### Patient Account
- **Email**: patient@test.com
- **Password**: password123
- **Features**: Book appointments, submit home visits, view queue status

### Doctor Account
- **Email**: doctor@test.com
- **Password**: password123
- **Features**: View patient appointments, manage schedules

### Admin Account
- **Email**: admin@test.com
- **Password**: password123
- **Features**: Full system access, manage queues, approve requests

## 📱 Usage Guide

### For Patients
1. **Login** with patient credentials
2. **Search** for doctors or other patients
3. **Book Appointments** with available time slots
4. **Submit Home Visit Requests** when needed
5. **Track Queue Status** in real-time

### For Admins
1. **Login** with admin credentials
2. **Manage Queue** by updating waiting times
3. **Review Home Visit Requests** and accept/reject
4. **Monitor Appointments** and assign waiting times
5. **Publish Updates** to keep patients informed

### For Doctors
1. **Login** with doctor credentials
2. **View Patient Appointments**
3. **Manage Schedule** and availability
4. **Track Home Visit Assignments**

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/me` - Get user appointments
- `GET /api/appointments/admin` - Get all appointments (admin)
- `POST /api/appointments/:id/waiting-time` - Assign waiting time

### Home Visits
- `POST /api/home-visits` - Submit home visit request
- `GET /api/home-visits` - Get all requests (admin)
- `POST /api/home-visits/:id/status` - Update request status

### Queue Management
- `GET /api/queue/:facilityId` - Get queue status
- `POST /api/queue/:facilityId` - Update queue
- `POST /api/queue/patient/:patientId/waiting-time` - Update patient waiting time

### Search
- `GET /api/search?q=query` - Search patients and doctors

## 🏗️ Architecture

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Role-based** access control

### Frontend
- **React** with functional components
- **Real-time** event bus system
- **Responsive** design
- **Modern** UI/UX

### Real-time Features
- **Event Bus**: Custom implementation for real-time updates
- **Queue Updates**: Live waiting time and status updates
- **Appointment Sync**: Real-time appointment management
- **Status Tracking**: Live home visit request status

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify database permissions

2. **Authentication Errors**
   - Clear browser localStorage
   - Re-login with valid credentials
   - Check JWT_SECRET in backend `.env`

3. **Port Conflicts**
   - Backend: Change PORT in `.env` file
   - Frontend: Use different port with `PORT=3001 npm start`

4. **API Errors**
   - Check if backend server is running
   - Verify API base URL in frontend
   - Check browser console for detailed errors

## 📝 Development Notes

### Adding New Features
1. Create backend routes in `backend/routes/`
2. Add corresponding models in `backend/models/`
3. Create frontend components in `frontend/src/components/`
4. Update API calls in `frontend/src/api.js`
5. Add routes in `frontend/src/App.js`

### Database Schema Updates
1. Update model files in `backend/models/`
2. Run seed script to update test data
3. Test with existing functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**CureQueue Healthcare App** - Making healthcare management efficient and patient-friendly! 🏥








