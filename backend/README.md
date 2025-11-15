# CureQueue Backend API

Node.js + Express backend for the CureQueue Healthcare Management System.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the backend directory with:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Seed test data** (optional):
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:5000`

## ☁️ Cloud Deployment

This backend is ready for deployment on cloud platforms like **Render**, **Railway**, or **Vercel**.

### Prerequisites

- MongoDB Atlas account (or any cloud MongoDB instance)
- Cloud platform account (Render/Railway/Vercel)

### Deployment Steps

#### Option 1: Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your repository**
3. **Configure the service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Add environment variables**:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - `production`
5. **Deploy** and access your API

#### Option 2: Deploy to Railway

1. **Create a new project** on [Railway](https://railway.app)
2. **Connect your GitHub repository**
3. **Set root directory** to `backend`
4. **Add environment variables**:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Railway will automatically detect and run `npm start`

#### Option 3: Deploy to Vercel (Serverless)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`** in backend directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set environment variables** in Vercel dashboard

### MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist all IP addresses (0.0.0.0/0) for cloud deployments
4. Get your connection string and add it to `MONGO_URI`

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ Yes |
| `PORT` | Server port (auto-assigned by cloud platforms) | ❌ No (default: 5000) |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `NODE_ENV` | Environment (development/production) | ❌ No |

## 🔌 API Endpoints

### Health Check
- `GET /` - Returns "CureQueue Backend Running"

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/me` - Get user appointments
- `GET /api/appointments/admin` - Get all appointments (admin only)

### Queue Management
- `GET /api/queue/:facilityId` - Get queue status
- `POST /api/queue/:facilityId` - Update queue
- `POST /api/queue/patient/:patientId/waiting-time` - Update waiting time

### Home Visits
- `POST /api/home-visits` - Submit home visit request
- `GET /api/home-visits` - Get all requests (admin)
- `POST /api/home-visits/:id/status` - Update request status

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/with-queues` - Get facilities with queue data

### Search
- `GET /api/search?q=query` - Search patients and doctors

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Enabled for cross-origin requests

## 📁 Project Structure

```
backend/
├── controllers/       # Business logic
├── middleware/        # Auth & validation middleware
├── models/           # Mongoose schemas
├── routes/           # API route definitions
├── utils/            # Helper functions
├── server.js         # Entry point
├── seed.js           # Database seeding script
├── package.json      # Dependencies & scripts
└── .env             # Environment variables (git-ignored)
```

## 🔒 Security Notes

- Never commit `.env` file to version control (already in `.gitignore`)
- Use strong JWT secrets in production
- MongoDB credentials should be stored securely
- CORS is currently open - configure for production frontend domain

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas network access (whitelist IPs)
- Ensure database user has proper permissions

### Port Binding Issues
- Cloud platforms auto-assign `PORT` - ensure using `process.env.PORT`
- Don't hardcode port numbers

### Authentication Errors
- Verify `JWT_SECRET` is set
- Check token format in request headers (`x-auth-token`)

## 📞 Support

For issues related to deployment or configuration, check the main project README or documentation files.
