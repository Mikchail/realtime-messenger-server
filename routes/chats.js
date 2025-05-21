const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create new chat
router.post('/', chatController.createChat);

// Get all chats for current user
router.get('/', chatController.getChats);

// Get specific chat by id
router.get('/:chatId', chatController.getChatById);

// Update chat settings (for group chats)
router.put('/:chatId', chatController.updateChat);

// Add participants to group chat
router.post('/:chatId/participants', chatController.addParticipants);

// Remove participant from group chat
router.delete('/:chatId/participants/:participantId', chatController.removeParticipant);

// Send message to chat
router.post('/:chatId/messages', messageController.sendMessage);

// Get messages for chat
router.get('/:chatId/messages', messageController.getMessages);

module.exports = router; 