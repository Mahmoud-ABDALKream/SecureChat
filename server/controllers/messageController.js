import forge from 'node-forge';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send encrypted message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, plaintext } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !plaintext) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    // Get receiver's public key
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Encrypt message with receiver's public key
    const publicKey = forge.pki.publicKeyFromPem(receiver.publicKey);
    const encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP');
    const ciphertext = forge.util.encode64(encrypted);

    // Create message
    const message = await Message.create({
      senderId,
      receiverId,
      ciphertext,
    });

    res.status(201).json({
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      ciphertext: message.ciphertext,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// @desc    Get messages for a user (with decryption)
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    // Verify user is either sender or receiver
    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get full user data including private key
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privateKey = forge.pki.privateKeyFromPem(user.privateKey);

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'username')
      .populate('receiverId', 'username')
      .sort({ createdAt: -1 });

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => {
      let decryptedText = '';
      try {
        // Only decrypt if current user is the receiver
        if (msg.receiverId._id.toString() === currentUserId) {
          const encrypted = forge.util.decode64(msg.ciphertext);
          decryptedText = privateKey.decrypt(encrypted, 'RSA-OAEP');
        } else {
          decryptedText = '[Sent message - decryptable by receiver]';
        }
      } catch (decryptError) {
        decryptedText = '[Unable to decrypt message]';
      }

      return {
        _id: msg._id,
        senderId: msg.senderId._id,
        senderUsername: msg.senderId.username,
        receiverId: msg.receiverId._id,
        receiverUsername: msg.receiverId.username,
        ciphertext: msg.ciphertext,
        plaintext: decryptedText,
        createdAt: msg.createdAt,
        isSender: msg.senderId._id.toString() === currentUserId,
      };
    });

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while retrieving messages' });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:otherUserId
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id.toString();

    // Get full user data including private key
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privateKey = forge.pki.privateKeyFromPem(user.privateKey);

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .populate('senderId', 'username')
      .populate('receiverId', 'username')
      .sort({ createdAt: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => {
      let decryptedText = '';
      try {
        const isReceiver = msg.receiverId._id.toString() === currentUserId;
        if (isReceiver) {
          const encrypted = forge.util.decode64(msg.ciphertext);
          decryptedText = privateKey.decrypt(encrypted, 'RSA-OAEP');
        } else {
          decryptedText = '[Encrypted sent message]';
        }
      } catch (decryptError) {
        decryptedText = '[Unable to decrypt]';
      }

      return {
        _id: msg._id,
        senderId: msg.senderId._id,
        senderUsername: msg.senderId.username,
        receiverId: msg.receiverId._id,
        receiverUsername: msg.receiverId.username,
        plaintext: decryptedText,
        createdAt: msg.createdAt,
        isSender: msg.senderId._id.toString() === currentUserId,
      };
    });

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error while retrieving conversation' });
  }
};
