# Campus Exchange

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![JWT Auth](https://img.shields.io/badge/JWT-Authentication-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

> A full-stack peer-to-peer marketplace platform specifically designed for verified college students to buy, sell, and exchange items within their campus community.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Authentication & Security](#authentication--security)
- [State Management](#state-management)
- [Technical Concepts](#technical-concepts)
- [Installation & Setup](#installation--setup)
- [Dependencies](#dependencies)
- [Challenges & Learnings](#challenges--learnings)
- [Future Improvements](#future-improvements)
- [Conclusion](#conclusion)

---

## 🎯 Project Overview

**Campus Exchange** is a trusted digital marketplace that connects verified college students to trade academic resources, electronics, housing opportunities, and services within their campus ecosystem. The platform eliminates the trust deficit of general marketplaces by requiring college email verification and implementing a structured booking system.

### Core Problem Solved
- **Trust Gap**: Students hesitate to buy/sell on general platforms due to safety concerns
- **Discovery Issues**: WhatsApp groups and notice boards lack structure and searchability
- **Price Exploitation**: Students often overpay or undersell due to lack of price transparency
- **Wasted Resources**: Textbooks and notes become obsolete after each semester

### Target Users
- College students looking to buy/sell used textbooks and notes
- Students seeking affordable electronics or calculators
- Those looking for roommates or housing near campus
- Students offering or seeking tutoring services
- Campus clubs promoting events

---

## ✨ Features

### Backend Features

| Feature | Implementation |
|---------|---------------|
| User Authentication | JWT-based with password hashing (bcryptjs) |
| Registration | Email, name, phone, college ID validation |
| Profile Management | Update personal info, social links, bio |
| Listing CRUD | Create, read, delete listings with images |
| Booking System | Request, accept, reject, cancel, complete flow |
| Rating System | 5-star ratings with reviews for completed transactions |
| Notifications | Real-time alerts for booking status changes |
| Messaging | Booking-specific chat between buyer and seller |

### Frontend Features

**Public Pages**
- Landing/Dashboard page with animated stats and hero section
- Login and Registration with password strength indicator
- Forgot password with email reset flow

**Authenticated Pages**
- **Browse**: Searchable, filterable marketplace with category chips
- **Listing Detail**: Image gallery with zoom, seller contact modal
- **Create Listing**: Multi-image upload with drag-drop, camera capture, price options
- **Profile**: View/edit profile, manage listings, delete/mark as sold
- **Bookings Dashboard**: Separate tabs for "My Bookings" (buyer) and "Requests" (seller), status filtering, rating modal

**Technical Frontend Features**
- Protected routes with token validation
- Context API for auth and booking state
- Axios interceptors for token injection
- Responsive design (mobile-friendly sidebar)
- Image upload with preview and reordering
- Camera capture for instant photos
- Real-time form validation

---

## 🏗 Project Architecture

### High-Level Flow

```
┌─────────────┐     HTTPS      ┌─────────────┐     MongoDB    ┌─────────────┐
│   React     │ ◄────────────► │   Express   │ ◄────────────► │   MongoDB   │
│   Frontend  │   REST APIs    │   Backend   │   Mongoose     │   Atlas     │
└─────────────┘                └─────────────┘                └─────────────┘
       │                              │
       │                              │
       ▼                              ▼
  LocalStorage                  JWT Token
  (token, user)                 Verification
```

### Request-Response Flow

**Authentication Flow:**
User submits login → Backend validates credentials → JWT generated → Token stored in localStorage → Frontend includes token in Authorization header for subsequent requests

**Booking Flow:**
Buyer clicks "Book Now" → Booking request created (status: pending) → Listing status becomes "pending" → Seller receives notification → Seller accepts/rejects → If accepted, listing becomes "booked" → Buyer can message seller → Seller marks complete → Buyer rates seller

**Image Upload Flow:**
User selects images → Converted to base64 → Sent in JSON payload → Stored as string array in MongoDB → Displayed via img src with data URL

### Middleware Chain

```
Request → CORS → JSON Parser → Auth Middleware (if protected) → Route Handler → Controller → Database → Response
```

**Auth Middleware Logic:**
1. Extract token from Authorization header
2. Verify token with JWT_SECRET
3. Attach decoded user to req.user
4. Pass to next middleware

---

## 📁 Folder & File Structure

### Backend Structure

```
backend/
├── server.js                 # Entry point, connects DB, registers routes
├── config/
│   └── db.js                 # MongoDB connection with error handling
├── models/
│   ├── User.js               # User schema (email unique, password hashed)
│   ├── Listing.js            # Item schema (title, price, images, status)
│   ├── Booking.js            # Booking schema (user, listing, seller, status)
│   ├── Message.js            # Chat messages per booking
│   └── Notification.js       # User notifications for booking events
├── controllers/
│   ├── authController.js     # register, login, getProfile, updateProfile
│   ├── listingController.js  # createListing, getAllListings, getListingById
│   ├── bookingController.js  # Full booking lifecycle (9 functions)
│   ├── messageController.js  # sendMessage, getMessages, getUnreadCount
│   ├── notificationController.js # CRUD for notifications
│   └── passwordResetController.js # Forgot/reset password with email
├── routes/
│   ├── authRoutes.js         # /register, /login, /profile (GET/PUT)
│   ├── listingRoutes.js      # GET /, GET /:id, POST /, DELETE /:id, PATCH /:id/status
│   ├── bookingRoutes.js      # Full CRUD for bookings
│   ├── messageRoutes.js      # /send, /booking/:bookingId, /unread/count
│   ├── notificationRoutes.js # GET /, /unread/count, PATCH /:id/read, /read-all
│   ├── passwordResetRoutes.js # /forgot-password, /verify-reset-token, /reset-password
│   └── userRoutes.js         # /profile, /listings, /bookings
├── middleware/
│   ├── authMiddleware.js     # JWT verification for protected routes
│   └── campusOnly.js         # Same as authMiddleware (alias)
└── utils/
    └── seedListings.js       # Seeds dummy listings if database empty
```

### Frontend Structure

```
frontend/
├── src/
│   ├── index.js              # React entry with StrictMode
│   ├── App.js                # Routes definition, Context providers
│   ├── api/
│   │   └── axios.js          # Axios instance with interceptors
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state, login, logout, token management
│   │   └── BookingContext.jsx # Booking state, fetch, create, accept, reject
│   ├── components/
│   │   └── ProtectedRoute.jsx # Redirect to /login if no token
│   ├── pages/
│   │   ├── Dashboard.jsx     # Landing page with stats, cards, testimonials
│   │   ├── Login.jsx         # Login form with validation
│   │   ├── Register.jsx      # Registration with password strength
│   │   ├── ForgotPassword.jsx # Email reset request
│   │   ├── ResetPassword.jsx  # Token-based password reset
│   │   ├── Browse.jsx        # Marketplace with search, filters, modals
│   │   ├── ListingDetail.jsx # Item details, image gallery, book button
│   │   ├── CreateListing.jsx # Multi-image upload, camera, pricing
│   │   ├── Profile.jsx       # User profile, listings management
│   │   └── Bookings.jsx      # Dual-tab booking dashboard
│   └── styles/               # Component-specific CSS files
```

---

## 🗄 Database Design

### Schema Relationships

```
User (1) ──────< (N) Listing     (One user has many listings)
User (1) ──────< (N) Booking     (One user has many bookings as buyer)
User (1) ──────< (N) Booking     (One user has many bookings as seller)
Listing (1) ───< (N) Booking     (One listing has many booking attempts)
Booking (1) ───< (N) Message     (One booking has many messages)
User (1) ──────< (N) Notification (One user has many notifications)
```

### Collections Detail

**User Collection:**
- name (String, required), email (String, required, unique)
- password (String, required, hashed), collegeId (String, required)
- phone, phoneNumber, mobile (String, default "")
- college, department, bio, semester, graduationYear
- socialLinks: { instagram, linkedin }
- averageRating (Number, default 0), totalRatings (Number)
- resetPasswordToken, resetPasswordExpires

**Listing Collection:**
- title, description, category (required)
- category enum: [Textbook, Notes, Electronics, Housing, Tutoring, Other]
- condition enum: [Brand New, Like New, Good, Fair, Poor]
- priceType enum: [fixed, negotiable, free]
- semester (String), price (Number)
- contactName (required), contactPhone, contactEmail, contactWhatsapp
- preferMode, availability, image, images [String]
- createdBy (ref: User), status enum: [available, pending, booked, sold]
- pendingBooking (ref: Booking), bookedBy (ref: User), bookedAt

**Booking Collection:**
- user (ref: User - buyer), listing (ref: Listing), seller (ref: User)
- status enum: [pending, accepted, rejected, cancelled, completed]
- message (max 500), sellerResponse, responseDate, completedDate
- rating: { score: 1-5, review, ratedAt }
- rebookingCount (Number, default 0)

**Message Collection:**
- booking (ref: Booking), sender (ref: User), receiver (ref: User)
- message (required, max 1000), read (Boolean), readAt

**Notification Collection:**
- user (ref: User), type enum: [booking_request, booking_accepted, booking_rejected, booking_cancelled, booking_completed, new_message]
- title, message, relatedId, relatedModel, read (Boolean), readAt

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Authenticate, get JWT | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

**Register Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "secure123",
  "collegeId": "CS2024001",
  "phone": "9876543210"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "60d5f9f4b5e6a7b8c9d0e1f2",
    "name": "John Doe",
    "email": "john@college.edu",
    "phone": "9876543210"
  }
}
```

### Listing Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/listings` | Get all available listings | No |
| GET | `/api/listings/:id` | Get single listing by ID | No |
| POST | `/api/listings` | Create new listing | Yes |
| DELETE | `/api/listings/:id` | Delete user's listing | Yes (owner only) |
| PATCH | `/api/listings/:id/status` | Update listing status | Yes (owner only) |

### Booking Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/bookings/request` | Create booking request | Yes |
| POST | `/api/bookings/accept` | Accept pending booking | Yes (seller only) |
| POST | `/api/bookings/reject` | Reject booking request | Yes (seller only) |
| DELETE | `/api/bookings/cancel/:bookingId` | Cancel pending booking | Yes (buyer only) |
| POST | `/api/bookings/complete/:bookingId` | Mark as completed | Yes (seller only) |
| POST | `/api/bookings/rate/:bookingId` | Rate completed transaction | Yes (buyer only) |
| GET | `/api/bookings/my-bookings` | Get user's bookings | Yes |
| GET | `/api/bookings/:bookingId` | Get single booking details | Yes |

### Message & Notification Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/messages/send` | Send message for a booking |
| GET | `/api/messages/booking/:bookingId` | Get messages for booking |
| GET | `/api/messages/unread/count` | Get unread message count |
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/unread/count` | Get unread count |

### Password Reset Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/forgot-password` | Send reset email |
| GET | `/api/auth/verify-reset-token/:token` | Verify reset token |
| POST | `/api/auth/reset-password/:token` | Reset password |

---

## 🔐 Authentication & Security

### JWT Implementation

```javascript
// Token generation (login)
const token = jwt.sign(
  { id: user._id, email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Token verification (authMiddleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### Password Security
- Passwords hashed using `bcryptjs` with salt rounds = 10
- Hashing done in controller before database insertion
- No plain-text passwords stored or transmitted

### Protected Routes Pattern

**Backend:**
```javascript
router.post("/", campusOnly, createListing);
router.delete("/:id", auth, async (req, res) => { ... });
```

**Frontend:**
```javascript
<Route path="/browse" element={
  <ProtectedRoute>
    <Browse />
  </ProtectedRoute>
} />
```

### Authorization Checks
- **Listing ownership**: `listing.createdBy.toString() !== req.user.id`
- **Booking permissions**: Verify user is either buyer or seller
- **Role-based actions**: Only sellers can accept/reject, only buyers can cancel/rate

---

## 🎨 State Management & Frontend Logic

### AuthContext

```javascript
{
  token,           // JWT from localStorage
  user,            // User object
  login(),         // Stores token, fetches profile
  logout(),        // Clears localStorage, resets state
  updateUser(),    // Updates local user after profile edit
  loading,         // Initial auth check status
  isAuthenticated  // Derived: !!token && !!user
}
```

### BookingContext

```javascript
{
  bookings,           // All user bookings
  pendingRequests,    // Filtered for seller
  createBookingRequest(listingId, message),
  acceptBooking(bookingId, responseMessage),
  rejectBooking(bookingId, reason),
  cancelBooking(bookingId),
  completeBooking(bookingId),
  rateBooking(bookingId, rating, review),
  fetchBookings()
}
```

### Axios Interceptors

```javascript
// Request interceptor - adds token automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handles 401 globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## ⚙ Important Technical Concepts

| Concept | Implementation |
|---------|----------------|
| **REST API** | All endpoints follow REST conventions |
| **JWT** | Token-based authentication with 7-day expiry |
| **Middleware** | Auth verification, campusOnly guard, error handling |
| **Async/Await** | Throughout controllers for database operations |
| **MVC Pattern** | Models (data), Controllers (logic), Views (React) |
| **Protected Routing** | Frontend component checks token before rendering |
| **Context API** | Auth and Booking state shared across components |
| **Local Storage** | Token and user data persisted across page reloads |
| **Database Indexes** | Booking schema includes indexes for performance |
| **File Handling** | Images converted to base64 for storage |
| **Error Handling** | Try-catch blocks with appropriate HTTP status codes |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Create .env file with required variables
# Add MONGO_URI, JWT_SECRET, PORT

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with API URL
# Add REACT_APP_API_URL

# Start development server
npm start
```

### Database Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option 2: MongoDB Atlas**
1. Create account at MongoDB Atlas
2. Create new cluster (free tier)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string for .env

### Production Deployment

**Backend (Render):**
- Push code to GitHub
- Connect repository to Render
- Set environment variables in Render dashboard
- Deploy automatically

**Frontend (Vercel):**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

---

## 📦 Dependencies Explained

### Backend Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework for REST API |
| `mongoose` | MongoDB ODM for schema modeling |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT generation and verification |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable management |
| `nodemailer` | Email sending for password reset |
| `nodemon` | Hot reload during development |

### Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client with interceptors |
| `framer-motion` | Animation library |
| `react-scripts` | Build tooling |

---

## 🧠 Challenges & Learnings

### Technical Challenges Solved

1. **Booking State Management**
   - Maintained booking status across buyer and seller views using separate UI tabs and filtered backend queries

2. **Image Upload Without Cloud Storage**
   - Converted images to base64 and stored directly in MongoDB as a simplified solution

3. **Pre-save Middleware Issues**
   - Moved password hashing to controller instead of Mongoose schema middleware

4. **CORS in Production**
   - Configured CORS with proper origin array for Render backend and Vercel frontend

5. **Real-time Notifications**
   - Implemented notification polling as interim solution before WebSocket integration

### What Developers Can Learn
- Building a complete marketplace with booking lifecycle
- JWT authentication from scratch
- Context API for global state
- REST API design patterns
- MongoDB relationships (ref and populate)
- Frontend form validation and error handling
- Deployment strategies (Render + Vercel)

---

## 🔮 Future Improvements

1. **WebSocket Integration** - Real-time chat and notifications using Socket.io
2. **Payment Integration** - Razorpay/Stripe for secure transactions
3. **Advanced Search Filters** - Price range, condition, distance-based filtering
4. **Cloud Image Storage** - Cloudinary/AWS S3 to reduce database load
5. **Email OTP Verification** - College email verification system
6. **Favorites/Wishlist** - Save listings for later
7. **Admin Dashboard** - User management and reported listings
8. **Progressive Web App** - Offline access and mobile app experience
9. **Analytics Dashboard** - Track popular categories and user activity
10. **Listing Expiry** - Auto-expire old listings

---

## 🎯 Conclusion

**Campus Exchange** is a production-ready peer-to-peer marketplace that successfully addresses trust and discovery challenges in student-to-student transactions. Built with the MERN stack, it implements:

- Complete authentication system with JWT
- Full CRUD operations for listings with image upload
- Comprehensive booking lifecycle (request → accept → complete → rate)
- Real-time notifications for booking events
- Messaging between transacting parties
- Rating system for seller reputation
- Responsive, mobile-friendly frontend

The project demonstrates professional-grade coding practices including MVC architecture, middleware patterns, Context API state management, and secure authentication flows.

---

**Project Status:** 🟢 Production Ready  
**Live Demo:** [https://pbl-project-wine.vercel.app/] 
```
