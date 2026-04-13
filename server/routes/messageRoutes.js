import express from 'express';
import { sendMessage, getMessages, getConversation } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.get('/conversation/:otherUserId', protect, getConversation);

export default router;
