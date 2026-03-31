# Admin Panel for Web Page Management

## Overview
This admin panel allows administrators and staff to manage web pages for the CCS Training Portal. The system provides a complete CRUD (Create, Read, Update, Delete) interface for managing pages with role-based access control.

## Features

### 1. Authentication & Authorization
- **Role-based access control**: Admin and staff roles can access the page management panel
- **JWT-based authentication**: Secure token-based authentication
- **Protected routes**: Only authorized users can access admin routes

### 2. Page Management
- **Create new pages**: Add new web pages with title, slug, content, category, and status
- **Edit existing pages**: Modify page content and metadata
- **Delete pages**: Remove pages from the system
- **Status management**: Change page status (draft, published, archived)
- **Filtering & Search**: Filter by status, category, and search by title/content
- **Statistics dashboard**: View page counts, views, and status distribution

### 3. Technical Stack

#### Backend (ExpressJS + MongoDB)
- **ExpressJS**: RESTful API server
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing enabled for frontend

#### Frontend (React)
- **React 18**: Component-based UI
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ccs-portal-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set your MongoDB connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/ccs-portal
     JWT_SECRET=your-secret-key-here
     PORT=5000
     ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ccs-portal-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file with:
     ```
     VITE_API_BASE_URL=http://localhost:5000/api
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/admin/register` - Register admin user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Page Management
- `GET /api/pages` - Get all pages (admin/staff only)
- `POST /api/pages` - Create new page (admin/staff only)
- `GET /api/pages/:id` - Get page by ID
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page
- `PATCH /api/pages/:id/status` - Update page status
- `GET /api/pages/published` - Get published pages (public)
- `GET /api/pages/slug/:slug` - Get page by slug (public)

## Usage Guide

### 1. Accessing the Admin Panel
1. Navigate to `http://localhost:3000/login`
2. Click on "Staff" or "Admin" role
3. Use email login with admin credentials:
   - Email: `admin@test.com`
   - Password: `Admin123!`
4. After login, navigate to `http://localhost:3000/admin/pages`

### 2. Creating a New Page
1. Click the "Create New Page" button
2. Fill in the form:
   - **Title**: Page title (required)
   - **Slug**: URL-friendly identifier (required)
   - **Category**: Page category (home, about, training, etc.)
   - **Status**: Draft or Published
   - **Excerpt**: Brief description (optional)
   - **Content**: Main page content (required)
3. Click "Create Page"

### 3. Managing Existing Pages
- **Edit**: Click the edit icon (pencil) on any page row
- **Publish**: Click the check icon on draft pages
- **Archive**: Click the archive icon on published pages
- **Delete**: Click the trash icon to remove a page
- **Filter**: Use the filter dropdowns to filter by status or category
- **Search**: Use the search box to find pages by title, slug, or content

### 4. Page Statistics
The dashboard shows:
- **Total Pages**: Count of all pages
- **Published**: Count of published pages
- **Drafts**: Count of draft pages
- **Total Views**: Sum of all page views

## Testing

### Backend API Testing
Use the provided `test-api.http` file or run these curl commands:

1. **Register admin user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/admin/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"Admin123!","name":"Test Admin","role":"admin"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"Admin123!"}'
   ```

3. **Create page** (use token from login):
   ```bash
   curl -X POST http://localhost:5000/api/pages \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Page","slug":"test-page","content":"Test content","status":"published","category":"general"}'
   ```

### Frontend Testing
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000/admin/pages`
3. Test all CRUD operations through the UI

## File Structure

### Backend
```
ccs-portal-backend/
├── server.js              # Main server file
├── package.json
├── .env                  # Environment variables
├── models/
│   ├── User.model.js     # User schema
│   └── Page.model.js     # Page schema
├── controllers/
│   ├── auth.controller.js
│   └── page.controller.js
├── middleware/
│   └── auth.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── admin.routes.js
│   └── page.routes.js
└── test-api.http        # API test requests
```

### Frontend
```
ccs-portal-frontend/
├── src/
│   ├── pages/
│   │   └── Admin/
│   │       ├── PageManagement.jsx    # Main admin panel
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       └── SystemGovernance.jsx
│   ├── services/
│   │   ├── authService.js           # Authentication service
│   │   └── pageService.js           # Page API service
│   ├── context/
│   │   └── AuthContext.jsx          # Auth context provider
│   ├── components/                  # Reusable components
│   └── App.jsx                      # Main app with routes
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Secure authentication with expiration
3. **Role-based Middleware**: Route protection based on user roles
4. **Input Validation**: Server-side validation for all inputs
5. **CORS Configuration**: Restricted to frontend origins only

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`

2. **CORS Errors**:
   - Verify frontend URL is in CORS configuration in `server.js`
   - Check if backend is running on correct port

3. **Authentication Errors**:
   - Verify JWT token is being sent in headers
   - Check token expiration

4. **Page Not Loading**:
   - Check browser console for errors
   - Verify API endpoints are accessible

### Debugging
- Backend logs: Check terminal running `node server.js`
- Frontend logs: Check browser developer console
- Network requests: Use browser Network tab to inspect API calls

## Deployment

### Backend Deployment
1. Set production environment variables
2. Use process manager (PM2) for Node.js
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificate

### Frontend Deployment
1. Build for production: `npm run build`
2. Serve static files with Nginx or deploy to Vercel/Netlify
3. Update API base URL in production environment

## Future Enhancements

1. **Rich Text Editor**: Integrate WYSIWYG editor for page content
2. **Image Upload**: Support for page featured images
3. **Version History**: Track page revisions
4. **Bulk Operations**: Import/export pages
5. **SEO Tools**: Advanced SEO analysis and suggestions
6. **Scheduling**: Schedule page publication
7. **Analytics**: Page view analytics and reports

## Support
For issues or questions:
1. Check the troubleshooting section
2. Review API documentation in `ccs-portal-backend/README.md`
3. Examine server logs for error details

---

**Last Updated**: March 31, 2026  
**Version**: 1.0.0