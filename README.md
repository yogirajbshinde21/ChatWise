# MERN Real Time Chat App with Group Features

## Security Notice

This application uses several API keys and sensitive configuration. Please follow these security practices:

## Environment Variables Setup

1. **Copy the environment template:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure your environment variables:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT tokens
   - `CLOUDINARY_*`: Your Cloudinary credentials for image uploads
   - `GEMINI_API_KEY`: Your Google Gemini API key for AI summaries

3. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## Security Best Practices

### ✅ What's Already Secured:
- API keys are stored in environment variables
- `.env` file is in `.gitignore` to prevent accidental commits
- Environment variables are validated on startup
- Fallback responses when API keys are missing

### ⚠️ Important Security Notes:
- **Never commit your `.env` file** - it contains sensitive API keys
- **Never hardcode API keys** in your source code
- **Use different API keys** for development and production
- **Rotate your API keys** regularly
- **Keep your dependencies updated**

### 📝 Deployment Security:
- Use environment variables in your deployment platform
- Enable CORS only for your frontend domain
- Use HTTPS in production
- Set `NODE_ENV=production` for production deployments

## Features

### Core Chat Features:
- Real-time messaging with Socket.IO
- Image sharing with Cloudinary
- User authentication with JWT
- Group chat functionality

### AI-Powered Features:
- **!Chatty Messages**: Mark messages as important for AI summarization
- **Group Summaries**: Get AI-generated summaries of group discussions
- **Smart Filtering**: Summaries only include unseen messages

### Group Management:
- Create and manage groups
- Add/remove members (admin only)
- Real-time group updates
- Member role management

## Demo Accounts

For testing purposes, you can use these demo accounts:
- **Account 1**: john@gmail.com / 123456
- **Account 2**: jane@gmail.com / 123456

## Installation

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/users` - Get all users
- `GET /api/messages/:id` - Get messages with user
- `POST /api/messages/:id` - Send message to user
- `GET /api/messages/group/:groupId` - Get group messages
- `POST /api/messages/group/:groupId` - Send group message

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id/summary` - Get AI summary
- `POST /api/groups/:id/members` - Add members
- `DELETE /api/groups/:id/members/:memberId` - Remove member

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Frontend**: React, Tailwind CSS, Vite
- **AI Integration**: Google Gemini API
- **Image Storage**: Cloudinary
- **Authentication**: JWT with bcrypt

## License

This project is for educational purposes.
