# Secure Messenger - Full-Stack Encrypted Messaging Application

A production-quality, full-stack secure messaging web application featuring end-to-end RSA encryption, JWT authentication, and a modern chat interface.

## Features

- 🔐 **RSA-OAEP Encryption**: All messages are encrypted using RSA with OAEP padding
- 🔑 **JWT Authentication**: Secure token-based authentication
- 🛡️ **Password Hashing**: bcrypt with 10 salt rounds
- 💬 **Real-time Chat UI**: Modern, responsive messaging interface
- 👥 **User Management**: Register, login, and browse users
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** (jsonwebtoken) - Authentication tokens
- **bcryptjs** - Password hashing
- **node-forge** - RSA encryption/decryption
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** (functional components + hooks)
- **Vite** - Build tool
- **Axios** - HTTP client
- **node-forge** - Client-side cryptography
- **CSS3** - Custom styling with CSS variables

## Project Structure

```
/workspace
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Chat.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── hooks/          # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   └── server.js       # Entry point
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── Message.js      # Message schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd /workspace/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/secure-messaging
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=1h
   ENCRYPTION_KEY_SECRET=your-encryption-key-secret-change-in-production
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Start the server:
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd /workspace/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages` | Send encrypted message | Yes |
| GET | `/api/messages/:userId` | Get user's messages | Yes |
| GET | `/api/messages/conversation/:otherUserId` | Get conversation | Yes |

## How Encryption Works

### RSA Key Generation

When a user registers, the server generates an RSA key pair using node-forge:

```javascript
const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
```

- **Public Key**: Stored in the database, shared with other users for encryption
- **Private Key**: Stored encrypted at rest, used only for decryption

### Message Encryption Flow

1. **Sender encrypts message:**
   ```javascript
   // Get receiver's public key from database
   const publicKey = forge.pki.publicKeyFromPem(receiver.publicKey);
   
   // Encrypt with RSA-OAEP
   const encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP');
   const ciphertext = forge.util.encode64(encrypted);
   
   // Store ciphertext in database
   ```

2. **Receiver decrypts message:**
   ```javascript
   // Get private key from database
   const privateKey = forge.pki.privateKeyFromPem(user.privateKey);
   
   // Decrypt with RSA-OAEP
   const encrypted = forge.util.decode64(ciphertext);
   const plaintext = privateKey.decrypt(encrypted, 'RSA-OAEP');
   ```

### Why RSA-OAEP?

- **OAEP (Optimal Asymmetric Encryption Padding)** provides semantic security
- Prevents various attacks that affect raw RSA
- Industry standard for asymmetric encryption

## How bcrypt Works

Passwords are hashed using bcrypt before storage:

```javascript
// In User model pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  // Generate salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  
  // Hash password with salt
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});
```

**Password Verification:**
```javascript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};
```

### Security Features of bcrypt:
- **Salting**: Each password gets a unique random salt
- **Adaptive Cost**: Salt rounds can be increased as hardware improves
- **One-way Function**: Cannot reverse hash to get original password

## How JWT Works

### Token Generation

```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h',
  });
};
```

### Token Verification Middleware

```javascript
export const protect = async (req, res, next) => {
  // Get token from Authorization header
  const token = req.headers.authorization.split(' ')[1];
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Get user from database
  req.user = await User.findById(decoded.id);
  
  next();
};
```

### JWT Security Features:
- **Stateless**: No session storage needed
- **Signed**: Tamper-proof with secret key
- **Expiring**: Tokens automatically expire
- **Payload**: Contains user ID for identification

## Security Measures

1. **Password Security**
   - Minimum 6 characters
   - Hashed with bcrypt (10 salt rounds)
   - Never stored or transmitted in plain text

2. **Message Security**
   - RSA-OAEP encryption (2048-bit keys)
   - Only ciphertext stored in database
   - Messages decrypted only on receiver's device

3. **Authentication Security**
   - JWT tokens with expiration
   - Protected routes require valid token
   - Tokens stored in localStorage (consider httpOnly cookies for production)

4. **API Security**
   - Helmet.js for security headers
   - CORS configuration
   - Input validation
   - Error handling without exposing internals

## Usage Guide

1. **Register**: Create an account with username and password
2. **Login**: Sign in with your credentials
3. **Select Contact**: Choose a user from the sidebar
4. **Send Message**: Type and send encrypted messages
5. **View Messages**: See decrypted received messages

## Development Commands

### Server
```bash
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start production server
```

### Client
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## Production Considerations

For production deployment:

1. **Environment Variables**: Use strong, unique secrets
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use MongoDB Atlas or managed service
4. **Token Storage**: Consider httpOnly cookies instead of localStorage
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Logging**: Implement proper logging and monitoring
7. **Input Validation**: Add comprehensive input validation

## License

MIT License - Feel free to use and modify for your projects.
