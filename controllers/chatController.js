const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { isGroup, name, participants } = req.body;
    
    // Validate input
    if (isGroup && (!name || !participants || !participants.length)) {
      return res.status(400).json({ error: 'Group chat requires name and participants' });
    }
    
    if (!isGroup && (!participants || participants.length !== 1)) {
      return res.status(400).json({ error: 'Direct chat requires exactly one participant' });
    }
    
    // For direct chat, check if chat already exists
    if (!isGroup) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: { 
          $all: [req.userId, participants[0]],
          $size: 2
        }
      });
      
      if (existingChat) {
        return res.json(existingChat);
      }
      
      // Check if participant exists
      const participant = await User.findById(participants[0]);
      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }
    } else {
      // For group chat, validate all participants exist
      for (const participantId of participants) {
        const participant = await User.findById(participantId);
        if (!participant) {
          return res.status(404).json({ error: `Participant ${participantId} not found` });
        }
      }
    }
    
    // Include the current user in participants
    let allParticipants = [...new Set([...participants, req.userId])];
    
    // Create new chat
    const newChat = new Chat({
      isGroup,
      name: isGroup ? name : '',
      participants: allParticipants,
      creator: req.userId
    });
    
    await newChat.save();
    
    // Populate participants
    await newChat.populate({
      path: 'participants',
      select: '-password'
    });
    
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all chats for the current user
exports.getChats = async (req, res) => {
  try {
    // Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: req.userId
    })
    .populate({
      path: 'participants',
      select: '-password'
    })
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: '-password'
      }
    })
    .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get chat by id
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate({
        path: 'participants',
        select: '-password'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: '-password'
        }
      });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    // console.log({chat: chat.participants});
    // console.log(req.userId);
    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.userId.toString())) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Get chat by id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update chat (for group chats only)
exports.updateChat = async (req, res) => {
  try {
    const { name, custom } = req.body;
    
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check if group chat
    if (!chat.isGroup) {
      return res.status(400).json({ error: 'Cannot update direct chat' });
    }
    
    // Check if user is the creator or a participant
    if (chat.creator.toString() !== req.userId &&
        !chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to update this chat' });
    }
    
    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (custom) updateData.custom = custom;
    
    // Update chat
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'participants',
      select: '-password'
    });
    
    res.json(updatedChat);
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add participants to group chat
exports.addParticipants = async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || !participants.length) {
      return res.status(400).json({ error: 'Participants are required' });
    }
    
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check if group chat
    if (!chat.isGroup) {
      return res.status(400).json({ error: 'Cannot add participants to direct chat' });
    }
    
    // Check if user is the creator
    if (chat.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only chat creator can add participants' });
    }
    
    // Add new participants
    const newParticipants = participants.filter(
      p => !chat.participants.includes(p)
    );
    
    if (newParticipants.length === 0) {
      return res.status(400).json({ error: 'All participants already in chat' });
    }
    
    // Update chat with new participants
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { $addToSet: { participants: { $each: newParticipants } } },
      { new: true, runValidators: true }
    ).populate({
      path: 'participants',
      select: '-password'
    });
    
    res.json(updatedChat);
  } catch (error) {
    console.error('Add participants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove participant from group chat
exports.removeParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Check if group chat
    if (!chat.isGroup) {
      return res.status(400).json({ error: 'Cannot remove participant from direct chat' });
    }
    
    // Check if user is the creator
    if (chat.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only chat creator can remove participants' });
    }
    
    // Make sure creator cannot remove themselves
    if (participantId === req.userId) {
      return res.status(400).json({ error: 'Creator cannot be removed from chat' });
    }
    
    // Update chat by removing participant
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { $pull: { participants: participantId } },
      { new: true, runValidators: true }
    ).populate({
      path: 'participants',
      select: '-password'
    });
    
    res.json(updatedChat);
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 