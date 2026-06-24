# ClubHub - Multi-Tenant Club Management Platform

## Step 1: Authentication & Role System Setup

This is Step 1 of the ClubHub platform development. You now have a complete authentication system with role-based access control.

### 🚀 Features Implemented

- **Landing Page**: Beautiful animated landing page with dark/light mode toggle
- **Authentication**: Email/password and Google OAuth sign-in/sign-up
- **Role System**: User, Admin, and Superadmin roles with different access levels
- **Admin Requests**: Users can request admin access, Superadmins can approve/reject
- **Dark Mode**: Persistent theme switching with Firestore integration
- **Protected Routes**: Role-based route protection
- **Real-time Updates**: Live admin request management

### 🔧 Setup Instructions

1. **Firebase Configuration**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Copy your Firebase config and replace the placeholder in `src/config/firebase.js`

2. **Update Firebase Config**
   ```javascript
   // Replace in src/config/firebase.js
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-actual-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

3. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own user document
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can create admin requests, superadmins can read/write all
       match /adminRequests/{requestId} {
         allow create: if request.auth != null;
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
       }
     }
   }
   ```

4. **Create First Superadmin**
   - Sign up with your email
   - Go to Firebase Console > Firestore
   - Find your user document in the `users` collection
   - Change the `role` field from `user` to `superadmin`

### 🎯 User Flows

**Regular User:**
1. Sign up/Login → Dashboard
2. Request admin access → Wait for approval
3. Once approved → Access admin features (coming in Step 2)

**Admin:**
1. Login → Dashboard with admin features
2. Create clubs (Step 2)
3. Manage clubs (Step 3)

**Superadmin:**
1. Login → Dashboard + Admin Requests access
2. Approve/reject admin requests
3. Manage platform settings

### 🔄 Next Steps

- **Step 2**: Club Creation & Template Selection
- **Step 3**: Club Customization & Branding  
- **Step 4**: Club Publishing & Unique Links
- **Step 5**: Member Management System
- **Step 6**: Core Club Features
- **Step 7**: Advanced Features & Analytics

### 🛠 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── SignUp.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   └── AdminRequests.jsx
├── config/
│   └── firebase.js
└── App.jsx
```

### 🎨 Design System

- **Colors**: Indigo primary, with dark mode support
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Heroicons for consistent iconography
- **Responsive**: Mobile-first design with Tailwind CSS

### 🔐 Security Features

- Firebase Authentication integration
- Role-based access control
- Protected routes
- Input validation
- Error handling with user-friendly messages

Ready for Step 2! 🚀
