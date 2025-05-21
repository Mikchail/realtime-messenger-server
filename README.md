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

## Docker Setup

The application is containerized using Docker and can be run with Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/realtime-messenger.git
   cd realtime-messenger
   ```

2. Create environment files:

   For the backend (`.env`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://mongodb:27017/messenger
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

   For the frontend (`client/.env`):
   ```
   VITE_API_URL=http://localhost
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - MongoDB: mongodb://localhost:27017

### Development with Docker

For development with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up
```

## Manual Setup

### Backend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/messenger
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
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