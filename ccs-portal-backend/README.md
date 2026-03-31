# CCS Training Portal - Backend

ExpressJS backend with MongoDB for the CCS Training Portal admin panel.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (admin, staff, faculty, placement, student)
- **Web Page Management**: Full CRUD operations for managing portal web pages
- **Admin Dashboard**: Statistics, user management, and system settings
- **RESTful API**: Well-structured endpoints with proper validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Page Management
- `GET /api/pages/published` - Get all published pages (public)
- `GET /api/pages/category/:category` - Get pages by category (public)
- `GET /api/pages/slug/:slug` - Get page by slug (public)
- `POST /api/pages` - Create new page (admin/staff only)
- `GET /api/pages` - Get all pages with filters (admin/staff only)
- `GET /api/pages/:id` - Get page by ID (admin/staff only)
- `PUT /api/pages/:id` - Update page (admin/staff only)
- `DELETE /api/pages/:id` - Delete page (admin/staff only)

### Admin Management
- `GET /api/admin/dashboard` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get user by ID (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `POST /api/admin/users` - Create new user (admin only)
- `GET /api/admin/settings` - Get system settings (admin only)
- `PUT /api/admin/settings` - Update system settings (admin only)

## Setup Instructions

### 1. Install Dependencies
```bash
cd ccs-portal-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ccs-portal
JWT_SECRET=your-secret-key
ADMIN_SECRET_KEY=admin-secret-123
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Windows
mongod

# For macOS/Linux
sudo systemctl start mongod
```

### 4. Run the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Database Models

### User Model
- `email`: Unique user email
- `password`: Hashed password
- `name`: User's full name
- `role`: User role (admin, staff, faculty, placement, student)
- `status`: Account status (active, inactive, suspended)
- `lastLogin`: Last login timestamp
- `createdAt`, `updatedAt`: Timestamps

### Page Model
- `title`: Page title
- `slug`: URL-friendly identifier
- `content`: Page content (HTML/text)
- `status`: Page status (published, draft, archived)
- `category`: Page category (home, about, training, faculty, placement, library, general)
- `author`: Reference to User who created the page
- `views`: View count
- `seoScore`: SEO optimization score
- `customFields`: Additional metadata

## Authentication Flow

1. User registers/login via `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Protected routes verify token and check user role
5. Admin/staff routes require `admin` or `staff` role

## Testing with Postman/curl

### Register a new admin user:
```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iilm.edu",
    "password": "admin123",
    "name": "Admin User",
    "secretKey": "admin-secret-123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iilm.edu",
    "password": "admin123"
  }'
```

### Create a page (with token):
```bash
curl -X POST http://localhost:5000/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "About Us",
    "slug": "about",
    "content": "About our institution...",
    "category": "about",
    "status": "published"
  }'
```

## Integration with Frontend

The frontend (React) should:
1. Store JWT token in localStorage or httpOnly cookies
2. Include token in Authorization header for protected requests
3. Handle token expiration and refresh
4. Redirect unauthorized users to login

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS configuration
- Environment variable configuration
- Error handling middleware