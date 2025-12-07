# NuaDrive

NuaDrive is a secure, intelligent, and scalable personal cloud storage solution designed for seamless file management. It combines enterprise-grade security with a modern, responsive user experience to bring you a robust alternative to traditional storage platforms.

## 🚀 Installation & Setup

Follow these steps to run NuaDrive locally.

### Prerequisites
*   Node.js (v18+ recommended)
*   MySQL Database (Local or Cloud like Aiven/Neon)
*   Backblaze B2 Account (or any S3-compatible object storage)

### 1. Clone the Repository
```bash
git clone https://github.com/tushar-glitch/nua-drive.git
cd nua-drive
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=nua_file_share
DB_PORT=3306 # Adjust for cloud providers

# Authentication
JWT_SECRET=your_super_secret_key

# Object Storage (S3/Backblaze)
B2_BUCKET_NAME=your_bucket_name
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
```


Start the Server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the Development Server:
```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

---

## ✨ Key Features

### 🔐 Secure Authentication & Access Control
Built with security at its core. NuaDrive uses strictly configured JWTs (HTTP-only, Secure) to ensure session safety. Cross-origin resource sharing (CORS) is hardened to prevent unauthorized access while enabling seamless cloud deployment.

### ☁️ S3-Compatible Storage Integration
Files are securely stored using S3-compatible object storage (Backblaze B2). This ensures durability, scalability, and high performance. All file access leverages Signed URLs, guaranteeing that private data remains private and expirable.

### 🗜️ Smart Transparent Compression
To optimize storage costs and network usage, NuaDrive includes an intelligent compression engine. Text-based files (CSV, JSON, Code, Logs) are automatically compressed with Gzip during upload. The browser automatically decompresses them on viewing, providing a seamless user experience with zero loss of functionality.

### 🤝 Granular Sharing System
Share files securely with anyone.
*   **Public Links**: Generate time-limited public links for quick sharing.
*   **Private Invites**: Share files specifically with registered users via email.
*   **Expiry Control**: Set optional expiration dates on shared links.

### 📜 Comprehensive Audit Logging
Track every interaction with your files. The Activity Tab provides a detailed history of:
*   **Views**: Who viewed a file and when.
*   **Downloads**: Tracking file downloads via secure endpoints.
*   **Shares**: Logs of permission changes and invites sent.
*   **Metadata**: Timestamps for security auditing.

### ⚡ Modern UX/UI
A polished, responsive interface built with React and Tailwind CSS. Features include drag-and-drop uploads, instant search, file previews, and an intuitive dashboard that works beautifully across desktop and mobile devices.

---

## 🛠️ Technology Stack

**Frontend**
*   React.js (Vite)
*   Tailwind CSS
*   Lucide React (Icons)
*   Vercel Analytics

**Backend**
*   Node.js & Express
*   MySQL (Relational Data)
*   AWS SDK (S3 Integration)
*   JsonWebToken (Auth)
*   Zlib (Compression)

**Infrastructure**
*   Vercel (Frontend Deployment)
*   Backblaze B2 (Object Storage)
*   Aiven (Cloud Database)
