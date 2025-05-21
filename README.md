# Realtime Messenger

A real-time messaging application with user authentication, personal and group chats, and profile customization.

## Features

- User registration and authentication with JWT
- Personal (1-on-1) chats
- Group chats with multiple participants
- Real-time messaging using Socket.IO
- User profile customization
- Chat customization for group chats
- Message status (read/unread)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v14.x or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd realtime-messenger
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/messenger
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/search` - Search users

### Chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats` - Get all chats for current user
- `GET /api/chats/:chatId` - Get a specific chat by ID
- `PUT /api/chats/:chatId` - Update chat settings
- `POST /api/chats/:chatId/participants` - Add participants to a group chat
- `DELETE /api/chats/:chatId/participants/:participantId` - Remove participant from a group chat

### Messages
- `POST /api/chats/:chatId/messages` - Send a message to a chat
- `GET /api/chats/:chatId/messages` - Get messages for a chat
- `PUT /api/messages/:messageId/read` - Mark a message as read
- `DELETE /api/messages/:messageId` - Delete a message

## Socket.IO Events

### Client Events (Emit)
- `joinChat` - Join a chat room
- `sendMessage` - Send a new message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server Events (Listen)
- `newMessage` - New message received
- `userStatus` - User status changed (online/offline)
- `typing` - User is typing
- `stopTyping` - User stopped typing

## License

MIT