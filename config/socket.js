const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = function(io) {
  // Store online users
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      // Get token from socket handshake
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error. Token missing.'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('Authentication error. User not found.'));
      }
      
      // Set user in socket
      socket.user = user;
      socket.userId = user._id.toString();
      
      next();
    } catch (error) {
      next(new Error('Authentication error. Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Add user to online users map
    onlineUsers.set(socket.userId, socket.id);
    
    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { status: 'online' }).catch(err => 
      console.error('Error updating user status:', err)
    );
    
    // Broadcast user online status
    socket.broadcast.emit('userStatus', { userId: socket.userId, status: 'online' });

    // Join personal room
    socket.join(socket.userId);
    
    // Handle message sending
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, text } = data;
        console.log({chatId, text});
        // Check if chat exists and user is a participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to send messages in this chat' });
          return;
        }
        
        // Create new message
        const newMessage = new Message({
          chatId,
          sender: socket.userId,
          text,
          readBy: [socket.userId] // Mark as read by sender
        });
        
        await newMessage.save();
        
        // Update last message in chat
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id
        });
        
        // Get sender info
        const sender = await User.findById(socket.userId).select('-password');
        
        // Emit to chat room
        io.to(chatId).emit('newMessage', {
          _id: newMessage._id,
          chatId,
          sender,
          text,
          readBy: [socket.userId],
          createdAt: newMessage.createdAt
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle joining chat rooms
    socket.on('joinChat', async (chatId) => {
      try {
        // Check if chat exists and user is a participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }
        
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat: ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Error joining chat' });
      }
    });
    
    // Handle typing status
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('typing', { 
        chatId, 
        userId: socket.userId 
      });
    });
    
    // Handle stop typing status
    socket.on('stopTyping', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('stopTyping', { 
        chatId, 
        userId: socket.userId 
      });
    });
    
    // Mark messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { messageId, userId } = data;
        console.log({messageId, userId});
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }
        
        // Check if user is participant in the chat
        const chat = await Chat.findById(message.chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to access this message' });
          return;
        }
        
        // Mark as read if not already
        if (!message.readBy.includes(socket.userId)) {
          message.readBy.push(socket.userId);
          await message.save();
          console.log('Notify chat room that message has been read', {userId, soketUser: socket.userId, chatId: message.chatId});
          // Notify chat room that message has been read
          io.to(message.chatId.toString()).emit('messageRead', {
            messageId,
            userId: userId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Error marking message as read' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from online users
      onlineUsers.delete(socket.userId);
      
      // Update user status to offline
      User.findByIdAndUpdate(socket.userId, { status: 'offline' }).catch(err => 
        console.error('Error updating user status:', err)
      );
      
      // Broadcast user offline status
      socket.broadcast.emit('userStatus', { userId: socket.userId, status: 'offline' });
    });
  });
}; 