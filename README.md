🔐 SecureChat
Secure Messaging Web Application

A modern web-based secure messaging application that enables users to communicate safely using encryption and secure authentication techniques.

This project demonstrates the practical application of Cryptography concepts such as password hashing and message encryption.

🚀 Features
👤 User Registration
🔐 Secure Login Authentication
🔑 Password Hashing using bcrypt
💬 Encrypted Messaging System
🔒 RSA Encryption using node-forge
📩 Send & Receive Secure Messages
📱 Responsive UI (React + Tailwind CSS)
🛠️ Tech Stack
Frontend
React (TypeScript)
Vite
Tailwind CSS
Backend
Node.js
Express.js
Security Libraries
bcrypt
node-forge
📁 Project Structure
SecureChat/
│
├── src/                # Frontend source code
├── dist/               # Production build
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
🔐 Security Implementation
🔑 Password Hashing
Passwords are never stored in plain text
Using bcrypt with salt:
const hashedPassword = await bcrypt.hash(password, 10);
During login:
The entered password is compared with the stored hash
🔒 RSA Encryption

This application uses Asymmetric Encryption (RSA).

🔁 Encryption Process:
Each user gets:
Public Key 🔓
Private Key 🔒
When sending a message:
Message is encrypted using receiver’s public key
When receiving:
Message is decrypted using receiver’s private key

✅ This ensures that only the intended user can read the message.

▶️ How to Run the Project
1. Clone the Repository
git clone https://github.com/Mahmoud-ABDALKream/SecureChat.git
cd SecureChat
2. Install Dependencies
npm install
3. Run the Project
npm run dev
4. Open in Browser
http://localhost:5173
🧪 How It Works
User registers an account
Password is hashed using bcrypt
User logs in securely
User sends a message
Message is:
🔒 Encrypted before storage
🔓 Decrypted when displayed
🎯 Learning Outcomes
Apply real-world cryptographic techniques
Understand difference between hashing and encryption
Implement secure authentication systems
Build a modern full-stack web application
⚠️ Important Notes
All passwords are securely hashed
All messages are stored in encrypted form
No sensitive data is stored as plain text
🔮 Future Improvements
🔄 Real-time messaging (Socket.io)
🔐 Encrypt private keys with user password
🌙 Dark mode
🔑 JWT Authentication
👨‍💻 Author

Mahmoud Abdelkarim
