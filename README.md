# ChatConnect - AI-Powered Group Chat App

A modern, full-stack real-time chat application that combines instant messaging with intelligent AI summaries. Built with the MERN stack and enhanced with Google Gemini AI for smart group conversation insights. Features responsive design, secure authentication, and seamless group management.

## 🎥 Demo Video

*[Demo video placeholder - Add your video link here]*

## 🎯 The Problem

Modern teams struggle with information overload in group chats. Important messages get lost in endless conversations, and joining ongoing discussions becomes overwhelming. Traditional chat apps lack intelligent filtering and context-aware summaries that help users catch up quickly.

## 💡 The Solution

ChatConnect addresses these challenges with:

- **AI-Powered Summaries**: Google Gemini API generates intelligent summaries of group conversations
- **Smart Message Filtering**: "!Chatty" messages are prioritized for AI analysis
- **Real-Time Intelligence**: Live updates with Socket.IO ensure everyone stays in sync
- **Intuitive Group Management**: Easy-to-use admin controls for member management
- **Mobile-First Design**: Responsive interface that works seamlessly across devices

## ✨ Key Features

### 🤖 AI Intelligence
- **Smart Summaries**: Get AI-generated summaries of group discussions using Google Gemini
- **Chatty Messages**: Mark important messages with "!Chatty" for AI prioritization
- **Context-Aware**: Summaries only include messages you haven't seen yet

### � Real-Time Communication
- **Instant Messaging**: Socket.IO-powered real-time chat
- **Group Conversations**: Create and manage group chats with multiple participants
- **Image Sharing**: Cloudinary integration for seamless image uploads
- **Online Status**: See who's online and active in real-time

### 👥 Group Management
- **Admin Controls**: Create groups, add/remove members, manage permissions
- **Member Roles**: Built-in admin and member role system
- **Live Updates**: Real-time group member updates and notifications

### 🔐 Security & Authentication
- **JWT Authentication**: Secure user sessions with JSON Web Tokens
- **Password Encryption**: bcrypt for secure password hashing
- **Environment Protection**: All API keys secured in environment variables
- **Input Validation**: Comprehensive validation on all user inputs

## 🚀 Quick Start

### Demo Accounts
Test the app instantly with these demo accounts:
- **john@gmail.com** / **123456**
- **jane@gmail.com** / **123456**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-chat-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file (see Environment Setup below)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Environment Setup

### Required API Keys

1. **MongoDB**: Get your connection string from [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Cloudinary**: Sign up at [Cloudinary](https://cloudinary.com/) for image uploads
3. **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_jwt_secret

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Features
GEMINI_API_KEY=your_gemini_api_key
```

## 🛡️ Security Features

- **Environment Variables**: All sensitive data secured in `.env` files
- **API Key Protection**: Never committed to version control
- **Input Validation**: Comprehensive validation on all endpoints
- **CORS Configuration**: Properly configured for production deployment
- **Authentication Middleware**: JWT-based route protection

## 🎨 Tech Stack

### Frontend
- **React** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Lightning-fast development server
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing

### AI & Cloud Services
- **Google Gemini API** - Advanced AI text generation
- **Cloudinary** - Image storage and optimization
- **MongoDB Atlas** - Cloud database hosting

## 📱 Mobile Experience

ChatConnect is built mobile-first with:
- Responsive design that adapts to all screen sizes
- Touch-friendly interface elements
- Optimized performance for mobile devices
- Progressive Web App (PWA) capabilities

## 🔮 Future Enhancements

- **Voice Messages**: Audio message support
- **File Sharing**: Document and file upload capabilities
- **Message Reactions**: Emoji reactions and message threading
- **Push Notifications**: Real-time notifications for mobile users
- **Advanced AI**: Sentiment analysis and conversation insights

## 🤝 Contributing

This project welcomes contributions! Feel free to:
- Report bugs or suggest features
- Submit pull requests
- Improve documentation
- Add new AI features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ by [Yogiraj Shinde](https://github.com/yogirajshinde) - A passionate full-stack developer creating innovative solutions for modern communication challenges.*
