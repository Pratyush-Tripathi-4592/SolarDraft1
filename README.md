# SolarDraft - Blockchain Solar Energy Trading Platform

A decentralized platform for trading solar energy using blockchain technology.

## 🚀 Features

- **User Authentication**: Secure login/register with JWT tokens
- **Blockchain Integration**: Web3.js integration with MetaMask
- **Smart Contracts**: Solidity contracts for energy trading
- **Real-time Transactions**: Track energy transactions on blockchain
- **Modern UI**: React + TypeScript + Tailwind CSS

## 📁 Project Structure

```
SolarDraft1/
├── backend/                 # Node.js + Express API
│   ├── controllers/         # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── contracts/          # Solidity smart contracts
│   └── server.js           # Main server file
├── frontend/               # React + TypeScript app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and Web3 services
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- MetaMask browser extension
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/solardraft
   PORT=5000
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=24h
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_WEB3_PROVIDER_URL=http://localhost:8545
   VITE_CONTRACT_ADDRESS=your_contract_address_here
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## 🌐 Web3 Integration

The frontend includes Web3.js integration for:
- MetaMask connection
- Smart contract interaction
- Transaction signing
- Account management

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or your preferred platform

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository. 