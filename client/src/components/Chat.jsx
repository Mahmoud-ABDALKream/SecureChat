import { useState, useEffect } from 'react';
import { usersAPI, messagesAPI } from '../services/api';
import forge from 'node-forge';

const Chat = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load conversation when selected user changes
  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser._id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadConversation = async (otherUserId) => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(otherUserId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      await messagesAPI.send(selectedUser._id, newMessage);
      setNewMessage('');
      // Reload conversation to get the new message
      await loadConversation(selectedUser._id);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Secure Messenger</h2>
          <div className="user-info">
            <span>{user.username}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        
        <div className="users-list">
          <h3>Contacts</h3>
          {users.length === 0 ? (
            <p className="no-users">No other users yet</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="user-avatar">{u.username.charAt(0).toUpperCase()}</div>
                <span>{u.username}</span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
                <div>
                  <h3>{selectedUser.username}</h3>
                  <span className="status">Online</span>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message-bubble ${msg.isSender ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{msg.plaintext}</div>
                    <div className="message-time">{formatTime(msg.createdAt)}</div>
                  </div>
                ))
              )}
            </div>

            <form className="message-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a secure message..."
                disabled={sending}
              />
              <button type="submit" disabled={sending || !newMessage.trim()} className="btn-send">
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <div className="empty-state">
              <h2>Welcome to Secure Messenger</h2>
              <p>Select a contact from the sidebar to start chatting</p>
              <p className="encryption-note">
                🔒 All messages are encrypted with RSA-OAEP encryption
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
