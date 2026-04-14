🔐 SecureChat – Encrypted Messaging Web App

A modern secure messaging web application that allows users to communicate safely using encryption and secure authentication techniques.

This project demonstrates the practical use of password hashing and encryption to protect sensitive data.

🚀 Features
👤 User Registration & Login
🔑 Secure password hashing using bcrypt
🔐 Encrypted messaging system
💬 Real-time style chat interface
📩 Send & receive secure messages
📱 Responsive modern UI (Tailwind CSS)
🛠️ Tech Stack
Frontend
React (with TypeScript)
Vite
Tailwind CSS
Backend (inside project or API layer)
Node.js
Express.js
Security
bcrypt → Password hashing
node-forge → RSA encryption
📁 Project Structure
SecureChat/
│
├── src/              # React source code
├── dist/             # Production build
├── index.html        # Entry HTML
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
🔐 Security Implementation
1. Password Hashing (bcrypt)
Passwords are never stored in plain text
Before saving:
const hashedPassword = await bcrypt.hash(password, 10);
During login:
Entered password is compared with stored hash
2. Encryption (RSA)

This application uses RSA (Asymmetric Encryption) via node-forge.

How it works:
Each user has:
🔓 Public Key
🔒 Private Key
Message Flow:
Sender writes a message
Message is encrypted using receiver’s public key
Encrypted message is stored
Receiver decrypts using private key

✅ Only the intended receiver can read the message

▶️ How to Run the Project
1. Clone the repository
git clone https://github.com/Mahmoud-ABDALKream/SecureChat.git
cd SecureChat
2. Install dependencies
npm install
3. Run development server
npm run dev
4. Open in browser
http://localhost:5173
🧪 Application Workflow
Register a new account
Login securely
Select another user
Send a message
Message is:
🔒 Encrypted before storage
🔓 Decrypted on display
🎯 Learning Objectives
Apply Cryptography concepts
Understand hashing vs encryption
Implement RSA encryption in real apps
Build secure full-stack applications
⚠️ Notes
All stored messages are encrypted
Passwords are securely hashed
No sensitive data is stored in plain text
📌 Future Improvements
🔄 Real-time chat using Socket.io
🔐 Encrypt private keys with user password
🌙 Dark mode UI
🔑 JWT authentication
👨‍💻 Author

Mahmoud Abdelkarim
