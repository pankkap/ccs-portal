# CCS Training Portal - Project Setup Guide

Comprehensive documentation for setting up, configuring, and deploying the CCS Training & Placement Portal.

---

## 1. Project Overview
The **CCS Training Portal** is a full-stack MERN application designed for IILM students and staff. It provides role-based access to training materials, placement opportunities, and administrative tools.

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Authentication**: Native Google OAuth 2.0 + JWT (Secured via HTTP-only Cookies).

---

## 2. Folder Structure
```text
/Training Portal
├── /ccs-portal-frontend      # React Application
│   ├── /src
│   │   ├── /components       # Reusable UI (Layout, Sidebar, Navbar)
│   │   ├── /context          # AuthContext (Session Management)
│   │   ├── /pages            # Role-specific Dashboards & Public Pages
│   │   └── /services         # API Services (Axios withCredentials)
│   └── index.html            # Entry point
├── /ccs-portal-backend       # Express Server
│   ├── /config               # Passport & DB Configurations
│   ├── /controllers          # Auth & Business Logic
│   ├── /middleware           # JWT Verification (Cookie-based)
│   ├── /models               # Mongoose User Schemas
│   ├── /routes               # API Endpoint Definitions
│   └── server.js             # Server Entry Point
└── PROJECT_SETUP.md          # You are here
```

---

## 3. Backend Setup

### Installation
1. Navigate to the backend directory:
   ```bash
   cd ccs-portal-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in `/ccs-portal-backend/` and populate it:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ccs-portal
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development

# Google OAuth (Obtained from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Admin Management
ADMIN_SECRET_KEY=admin-secret-123
```

### Running the Server
```bash
npm run dev
```

---

## 4. Frontend Setup

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd ccs-portal-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Ensure your `.env` (or environment config) points to the backend:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the App
```bash
npm run dev
```

---

## 5. Google OAuth Setup
The application uses a **Native Passport.js** strategy rather than Firebase for superior security and cookie control.

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a "Web Application" OAuth Client ID.
3. **Authorized JavaScript Origins**: `http://localhost:3000`
4. **Authorized Redirect URIs**: `http://localhost:5000/auth/google/callback`
5. **Domain Restriction**: The backend automatically rejects any login attempt not using an `@iilm.edu` email address.

---

## 6. Authentication Flow
This project utilizes a production-grade **Stateless Cookie Flow**:

1. **Frontend**: User clicks "Sign in with Google" → redirects browser to `GET /auth/google`.
2. **Google**: User authenticates on Google's servers.
3. **Backend**: Google redirects to `GET /auth/google/callback`.
   - Backend verifies the email domain is `@iilm.edu`.
   - Backend checks if the user exists in MongoDB.
   - Backend generates a JWT and attaches it to an **HTTP-only Cookie**.
4. **Redirect**: Backend redirects user back to `http://localhost:3000/dashboard`.
5. **Session**: `AuthContext` on mount pings `GET /api/auth/profile`. Browser automatically sends the secure cookie; backend verifies and returns User Profile.

---

## 7. Security Architecture

### Why HTTP-only Cookies?
- **XSS Protection**: Since the JWT is stored in an `httpOnly` cookie, it is invisible to JavaScript. Malicious scripts cannot "steal" your token from `localStorage`.
- **CSRF Mitigation**: Uses `SameSite: Strict` or `Lax` to prevent cross-site request forgery.
- **withCredentials**: The frontend Axios instance is configured with `withCredentials: true`, allowing it to communicate the cookie securely with the backend.

---

## 8. Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/auth/google` | Initiates Google Login |
| `GET` | `/auth/google/callback` | Passport callback handler |
| `POST` | `/api/auth/login` | Email/Password login (set cookie) |
| `POST` | `/api/auth/logout` | Clears the auth cookie |
| `GET` | `/api/auth/profile` | Fetches current user from cookie |

---

## 9. Deployment Guide

### Backend (e.g., Render/Heroku)
- Connect your GitHub repo.
- Set all `.env` variables in the platform's Dashboard.
- Ensure `NODE_ENV` is set to `production` (this enables the `Secure` flag on cookies).

### Frontend (e.g., Vercel/Netlify)
- Connect your GitHub repo.
- Set `VITE_API_BASE_URL` to your production backend URL.
- **Note**: Ensure your Backend's CORS configuration includes your production frontend URL.

---

## 10. Troubleshooting

- **Redirect URI Mismatch**: Ensure Google Console exactly matches `http://localhost:5000/auth/google/callback` (case sensitive).
- **Cookies Internal/Private Mode**: Some browsers block third-party cookies in incognito. Ensure your frontend and backend share the same base domain in production.
- **Unauthorized Domain**: Only users with `@iilm.edu` can log in via Google.

---

## 11. Important Notes
- **User Bootstrap**: To create the first Admin account, use the `fix_user_upgrade.js` script or manually update a MongoDB record's `role` field to `admin`.
- **Staff Creation**: Admins must pre-create Staff accounts (Faculty/Placement) in the User Management section so that their roles are correctly assigned during their first Google Login.
