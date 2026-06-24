# 🔗 ClubOnLink (Orbitra)

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Suite-orange.svg?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF.svg?logo=stripe)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5.svg?logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**ClubOnLink** is an enterprise-grade, multi-tenant community and club management SaaS platform. It enables organizations, universities, and clubs to spawn customized portals under isolated subdomains/routes, manage members with role-based access control (RBAC), process premium subscription billing, manage real-time leaderboards, and view engagement analytics on a sleek, interactive dashboard.

---

## 🚀 Key Features

*   **🛡️ Multi-Tenant Architecture & RBAC**: Automated onboarding for new clubs with fully isolated tenant data. Multi-level permissions support `User`, `Admin`, and `Superadmin` roles with custom access control lists.
*   **💳 Payment & Subscription Billing**: Multi-gateway payment handling using Stripe and Razorpay integrations for premium tiers, event ticketing, automated invoicing, and membership plans.
*   **🏆 Transaction-Safe Leaderboard System**: Gaming-focused leaderboard supporting real-time score increments, rank calculation (with tie-handling), and seasonal resets utilizing Firestore transactions (`runTransaction`).
*   **🖼️ Media Hub with Cloudinary CDN**: Drag-and-drop file uploader with lazy-loaded masonry gallery layouts, lightbox viewports, and an administrative moderation workflow for uploaded member media.
*   **📊 Real-time Engagement Analytics**: Live dashboards visualizing membership growth, event attendance rates, and financial reports powered by Recharts (line, bar, and area charts).
*   **🔔 Push Notification Center**: Web push notifications powered by Firebase Cloud Messaging (FCM) supporting targeted messaging (e.g., all members, specific roles, or individuals) with read-status tracking.
*   **🎨 Dynamic Live Branding Preview**: Live interactive customization suite where admins can choose color themes, template layouts, navigation bars, and preview changes in real time.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Recharts, React Router v7.
*   **Backend & Database**: Firebase Firestore (NoSQL), Cloud Functions (Serverless Node.js backend), Firebase Authentication.
*   **Third-party Services**: Cloudinary (Media management & CDN), Stripe & Razorpay (Payment gateways), Firebase Cloud Messaging (FCM).

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── auth/            # Sign In / Sign Up components
│   ├── club-creation/   # Step-by-step club setup wizard
│   ├── club-customization/# Branding, layout, and preview controls
│   ├── club-portal/     # Core tenant layout & wrapper
│   ├── gallery/         # Cloudinary CDN masonry grid & uploader
│   └── notifications/   # In-app notifications center
├── contexts/            # Global state managers (Auth, Theme, Member Management)
├── hooks/               # Core data Hooks (useRealtimeCollection, useLeaderboard, FCM)
├── pages/               # Primary routed pages & admin panels
└── utils/               # Helper utilities (Cloudinary, CSV export, role checkers)
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   Firebase Project (with Auth, Firestore, and FCM enabled)
*   Cloudinary Account
*   Stripe / Razorpay developer keys

### 2. Installation
Clone the repository and install dependencies for both the API wrapper and the frontend application:
```bash
# Clone the repository
git clone https://github.com/Arunsanap99/clubonlink.git
cd clubonlink

# Install root dependencies
npm install

# Install frontend app dependencies
cd Orbitra/app
npm install
```

### 3. Environment Variables
Create a `.env` file in `Orbitra/app/` with the following variables:
```bash
# Firebase Credentials
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Cloudinary Config
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Payments
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Running Locally
```bash
# From Orbitra/app/ directory
npm run dev
```

---

## 🔒 Firestore Security Rules

To ensure total isolation between tenants and secure member records, deploy these core security rules to your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leaderboard validation
    match /clubs/{clubId}/leaderboards/{boardId}/entries/{entryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Media Gallery permission
    match /clubs/{clubId}/gallery/images/{imageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.uploaderId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
