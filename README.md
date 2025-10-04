# 🎵 PlayLoud - Online Music Streaming Platform

<div align="center">

![PlayLoud Banner](https://img.shields.io/badge/PlayLoud-Music%20Streaming-green?style=for-the-badge&logo=spotify)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js)
![Appwrite](https://img.shields.io/badge/Appwrite-BaaS-red?style=for-the-badge&logo=appwrite)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blue?style=for-the-badge)

**A modern, full-featured music streaming web application with premium subscriptions**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [License](#-license)

</div>

---

## 📖 About

PlayLoud is a full-stack online music streaming platform that provides users with a seamless music listening experience. Built with React.js and powered by Appwrite as Backend-as-a-Service (BaaS), it features authentication, music playback, playlist management, and premium subscriptions through Razorpay integration.

---

## ✨ Features

### 🎧 Core Music Features
- **Music Playback**: Persistent audio player that works across all pages
- **Browse & Search**: Discover songs, artists, and genres
- **Smart Playlists**: Create, edit, and manage custom playlists
- **Liked Songs**: Save your favorite tracks for quick access
- **Recently Played**: Keep track of your listening history
- **Genre & Artist Pages**: Explore music by category

### 👤 User Management
- **Authentication**: Email/Password and Google OAuth login
- **User Profiles**: Customizable profiles with avatar upload
- **Secure Sessions**: Token-based authentication with Appwrite

### 💎 Premium Features
- **Subscription Plans**: Monthly, Quarterly, and Half-Yearly options
- **Razorpay Integration**: Secure payment processing
- **Premium Benefits**:
  - Ad-free listening
  - Offline playback
  - Unlimited skips
  - Exclusive content
  - Priority support
  - Early access to new releases

### 🎨 UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Persistent Player**: Music continues playing while navigating
- **Real-time Updates**: Dynamic content loading

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.13
- **Routing**: React Router DOM 7.9.1
- **Icons**: Heroicons 2.2.0
- **Language**: JavaScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Payment Gateway**: Razorpay 2.9.6
- **Server SDK**: node-appwrite 20.0.0

### BaaS & Database
- **Backend-as-a-Service**: Appwrite
- **Authentication**: Appwrite Auth (Email/Password, Google OAuth)
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage (for audio files and images)

### Additional Tools
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 17.2.3
- **Development**: nodemon (for backend hot-reload)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Appwrite Account** (for BaaS)
- **Razorpay Account** (for payment integration)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/playloud.git
cd playloud
```

#### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create frontend .env file
cp .env.example .env
```

**Configure Frontend Environment Variables** (`.env`):
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_APPWRITE_STORAGE_ID=your_storage_id
```

#### 3. Backend Setup

```bash
# Navigate to backend folder
cd playloud-backend

# Install backend dependencies
npm install

# Create backend .env file
cp .env.example .env
```

**Configure Backend Environment Variables** (`playloud-backend/.env`):
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=your_database_id

# Collection IDs
SUBSCRIPTIONS_COLLECTION_ID=your_subscriptions_collection_id
PAYMENTS_COLLECTION_ID=your_payments_collection_id

# Optional
WEBHOOK_SECRET=your_webhook_secret
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

#### 4. Appwrite Setup

1. **Create Appwrite Project**
   - Go to [Appwrite Console](https://cloud.appwrite.io)
   - Create a new project named "PlayLoud"
   - Copy your Project ID

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Enable Google OAuth provider
   - Add authorized redirect URIs

3. **Create Database**
   - Create a new database (e.g., "PlayLoud_DB")
   - Copy Database ID

4. **Create Collections**
   
   Create the following collections with their attributes:

   **songs**
   - title (string)
   - artist (string)
   - album (string)
   - genre (string)
   - duration (integer)
   - audioFileId (string)
   - coverImageId (string)
   - releaseDate (datetime)

   **playlists**
   - userId (string)
   - name (string)
   - description (string)
   - coverImageId (string)
   - isPublic (boolean)
   - createdAt (datetime)

   **playlist_songs**
   - playlistId (string)
   - songId (string)
   - addedAt (datetime)
   - order (integer)

   **liked_songs**
   - userId (string)
   - songId (string)
   - likedAt (datetime)

   **recently_played**
   - userId (string)
   - songId (string)
   - playedAt (datetime)

   **subscriptions**
   - userId (string)
   - planId (string)
   - planName (string)
   - amount (integer)
   - status (string)
   - startDate (datetime)
   - endDate (datetime)
   - razorpayPaymentId (string)

   **payments**
   - userId (string)
   - planId (string)
   - planName (string)
   - amount (integer)
   - currency (string)
   - status (string)
   - razorpayPaymentId (string)
   - razorpayOrderId (string)
   - paidAt (datetime)

5. **Create Storage Bucket**
   - Create a bucket for audio files and images
   - Set appropriate permissions
   - Copy Bucket ID

6. **Generate API Key**
   - Go to Settings → API Keys
   - Create a new API key for server-side operations
   - Grant necessary permissions (databases, storage)
   - Copy the API key for backend `.env`

#### 5. Razorpay Setup

1. **Create Razorpay Account**
   - Sign up at [Razorpay](https://razorpay.com)
   - Switch to Test Mode for development

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate Test Keys
   - Copy Key ID and Key Secret

3. **Configure Webhooks** (Optional)
   - Go to Settings → Webhooks
   - Add webhook URL: `http://localhost:5000/webhook`
   - Select events: payment.captured, payment.failed
   - Copy webhook secret

---

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd playloud-backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend (in a new terminal)
```bash
# From project root
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Backend (production)
cd playloud-backend
npm start
```

---

## 📸 Screenshots

### Home Page
*Main landing page with featured songs and playlists*

### Browse & Search
*Discover new music, artists, and genres*

### Music Player
*Persistent player with playback controls*

### Playlists
*Create and manage custom playlists*

### Liked Songs
*Access your favorite tracks*

### Premium Plans
*Subscribe to premium features*

### User Profile
*Manage your account and preferences*

### Payment Flow
*Secure Razorpay checkout process*

---

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Add `.env` to `.gitignore`
- Use different API keys for development and production
- Rotate API keys periodically

### Backend Security
- Keep Razorpay Key Secret server-side only
- Validate all payment signatures on backend
- Use Appwrite API keys with minimal required permissions
- Implement rate limiting for API endpoints
- Enable CORS with specific origin whitelist

### Frontend Security
- Never expose sensitive keys in frontend code
- Validate user inputs
- Implement proper authentication checks
- Use secure session management

---

## 🧪 Testing Payment Integration

### Test Cards (Razorpay Test Mode)

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`

**UPI:**
- UPI ID: `success@razorpay`

---

## 📁 Project Structure

```
PlayLoud/
├── playloud-backend/          # Backend server
│   ├── .env                   # Backend environment variables
│   ├── server.js              # Express server entry point
│   └── package.json           # Backend dependencies
│
├── src/                       # Frontend source code
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── pages/            # Page components
│   │   ├── profile/          # User profile
│   │   └── ui/               # Reusable UI components
│   ├── context/              # React Context (state management)
│   ├── lib/                  # Configuration files
│   │   └── appwrite.js       # Appwrite client setup
│   ├── utils/                # Helper functions
│   ├── App.jsx               # Main App component
│   └── main.jsx              # Entry point
│
├── public/                    # Public assets
├── .env                       # Frontend environment variables
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Razorpay is not defined"
**Solution:** Razorpay SDK is loaded dynamically in Premium.jsx. Ensure your internet connection is stable.

#### Payment Verification Failed
**Solution:** 
- Verify Razorpay Key Secret in backend `.env`
- Ensure backend server is running
- Check signature verification logic

#### CORS Errors
**Solution:**
- Verify `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Ensure backend is running before starting frontend

#### Appwrite Connection Issues
**Solution:**
- Verify all Appwrite IDs in `.env` files are correct
- Check Appwrite project settings
- Ensure API key has required permissions

#### Collection Not Found
**Solution:**
- Get actual Collection IDs from Appwrite Console
- Collection ID is in the URL when viewing a collection
- Update backend `.env` with correct IDs

---

## 📚 API Endpoints

### Backend Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify-payment` | Verify payment signature |
| POST | `/webhook` | Handle Razorpay webhooks |

---

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to:
   - Vercel: `vercel --prod`
   - Netlify: Drag & drop `dist` folder

3. Add environment variables in hosting platform

### Backend Deployment (Railway/Render/Heroku)

1. Push backend to separate repository
2. Configure environment variables on platform
3. Deploy and note the production URL
4. Update frontend to use production backend URL

### Production Checklist
- [ ] Switch Razorpay to Live Mode
- [ ] Update all API keys to production values
- [ ] Enable HTTPS
- [ ] Configure production CORS origins
- [ ] Set up monitoring and logging
- [ ] Test all payment flows
- [ ] Configure webhooks with production URL

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the terms specified in `LICENSE.txt`.

---

## 🙏 Acknowledgments

- [Appwrite](https://appwrite.io) - For providing excellent BaaS platform
- [Razorpay](https://razorpay.com) - For secure payment processing
- [React](https://react.dev) - For the amazing frontend framework
- [Tailwind CSS](https://tailwindcss.com) - For rapid UI development
- [Vite](https://vitejs.dev) - For blazing fast development experience

---

## 📧 Contact

For questions or support, please open an issue on GitHub or contact:

- **Project Repository**: [PlayLoud](https://github.com/ChiragVasava/PlayLoud.git)
- **Email**: v.chira.007@gmail.com

---

<div align="center">

Made with ❤️ by [Chirag Vasava](https://github.com/ChiragVasava)

⭐ Star this repo if you find it helpful!

</div>