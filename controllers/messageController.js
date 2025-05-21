const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    
    if (!chatId || !text) {
      return res.status(400).json({ error: 'Chat ID and message text are required' });
    }
    
    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Verify user is a participant in the chat
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }
    
    // Create new message
    const newMessage = new Message({
      chatId,
      sender: req.userId,
      text,
      readBy: [req.userId] // Mark as read by sender
    });
    
    await newMessage.save();
    
    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id
    });
    
    // Populate sender info
    await newMessage.populate({
      path: 'sender',
      select: '-password'
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Check if chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Verify user is a participant in the chat
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to view messages in this chat' });
    }
    
    // Pagination
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Get messages
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'sender',
        select: '-password'
      });
    
    // Mark messages as read by current user
    await Message.updateMany(
      {
        chatId,
        readBy: { $ne: req.userId }
      },
      {
        $addToSet: { readBy: req.userId }
      }
    );
    
    res.json(messages.reverse()); // Reverse to get oldest first
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is a participant in the chat
    const chat = await Chat.findById(message.chatId);
    if (!chat || !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to access this message' });
    }
    
    // Mark as read if not already
    if (!message.readBy.includes(req.userId)) {
      message.readBy.push(req.userId);
      await message.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete message (only sender can delete their own message)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }
    
    // Delete message
    await Message.findByIdAndDelete(messageId);
    
    // If this was the last message, update the chat's lastMessage field
    const chat = await Chat.findById(message.chatId);
    if (chat && chat.lastMessage && chat.lastMessage.toString() === messageId) {
      // Find the new last message
      const newLastMessage = await Message.findOne({ chatId: message.chatId })
        .sort({ createdAt: -1 });
      
      // Update the chat
      await Chat.findByIdAndUpdate(message.chatId, {
        lastMessage: newLastMessage ? newLastMessage._id : null
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 