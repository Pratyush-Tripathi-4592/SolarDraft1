# Electricity Trading Platform - Setup Instructions

## Overview
This is a three-sided blockchain electricity trading application with:
- **Seller Side**: Users who have electricity units to sell
- **Buyer Side**: Users who want to purchase electricity units  
- **Government Side**: Regulatory body that approves/rejects transactions

## Prerequisites
1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **MetaMask** browser extension
4. **Ganache** (for local blockchain development)

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configurations
```

Required environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/electricity_trading
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
BLOCKCHAIN_NODE_URL=http://localhost:8545
```

### 3. MongoDB Setup
**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Create database
mongosh
use electricity_trading
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string and update MONGODB_URI in .env

### 4. Blockchain Setup (Ganache)
```bash
# Install Ganache CLI globally
npm install -g ganache-cli

# Start Ganache on port 8545
ganache-cli -p 8545 -d

# Note down the generated accounts and private keys
```

### 5. Deploy Smart Contracts
```bash
# Install Hardhat dependencies (if not already installed)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile contracts
npx hardhat compile

# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost
```

### 6. Start Backend Server
```bash
npm run dev
```
Server will start on http://localhost:5000

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Update API Base URL
Ensure axios requests point to your backend:
- Update API calls in components to use `http://localhost:5000` if needed

### 3. Start Frontend Development Server
```bash
npm run dev
```
Frontend will start on http://localhost:3000

## MetaMask Configuration

### 1. Install MetaMask
- Install MetaMask browser extension
- Create or import wallet

### 2. Add Local Network
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Add Custom RPC:
   - Network Name: `Local Ganache`
   - New RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

### 3. Import Test Accounts
- Import private keys from Ganache into MetaMask
- You'll need at least 3 accounts for testing (seller, buyer, government)

## Database Seeding (Optional)

Create test users directly in MongoDB:

```javascript
// Connect to MongoDB and run these commands
use electricity_trading

// Create test seller
db.users.insertOne({
  username: "test_seller",
  email: "seller@demo.com",
  role: "seller",
  passwordHash: "$2b$10$...", // Use bcrypt to hash "password123"
  blockchainAddress: "0x...", // Use one of your Ganache addresses
  electricityUnits: 1000,
  pricePerUnit: 0.05,
  location: "Solar Farm A",
  isActive: true,
  registrationDate: new Date()
})

// Create test buyer
db.users.insertOne({
  username: "test_buyer", 
  email: "buyer@demo.com",
  role: "buyer",
  passwordHash: "$2b$10$...", // Use bcrypt to hash "password123"
  blockchainAddress: "0x...", // Use another Ganache address
  walletBalance: 1000,
  isActive: true,
  registrationDate: new Date()
})

// Create test government user
db.users.insertOne({
  username: "government_admin",
  email: "gov@demo.com", 
  role: "government",
  passwordHash: "$2b$10$...", // Use bcrypt to hash "password123"
  blockchainAddress: "0x...", // Use another Ganache address
  governmentId: "GOV001",
  department: "Energy Regulatory Commission",
  isActive: true,
  registrationDate: new Date()
})
```

## Testing the Application

### 1. User Registration/Login
- Go to http://localhost:3000
- Register users with different roles (seller, buyer, government)
- Use MetaMask addresses for blockchain integration

### 2. Seller Workflow
1. Login as seller
2. Add electricity units (units available, price, generation source, location)
3. View transaction requests from buyers
4. Accept/reject purchase requests

### 3. Buyer Workflow  
1. Login as buyer
2. Browse available electricity units
3. Create purchase requests
4. Complete payments via MetaMask after government approval

### 4. Government Workflow
1. Login as government user
2. Review pending transactions
3. Approve/reject transactions with notes
4. Manage user accounts (suspend/activate)

### 5. Blockchain Integration
- When buyers complete transactions, MetaMask popup will appear
- Confirm transaction in MetaMask
- Smart contract will be deployed and transaction recorded on blockchain

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Seller Routes
- `POST /api/seller/register` - Update seller profile
- `POST /api/seller/units` - Create electricity unit
- `GET /api/seller/units` - Get seller's units
- `PUT /api/seller/units/:unitId` - Update unit
- `DELETE /api/seller/units/:unitId` - Delete unit
- `GET /api/seller/transactions` - Get seller transactions
- `POST /api/seller/transactions/:transactionId/respond` - Accept/reject requests

### Buyer Routes
- `GET /api/buyer/units` - Browse available units
- `GET /api/buyer/units/:unitId` - Get unit details
- `POST /api/buyer/purchase-request` - Create purchase request
- `GET /api/buyer/transactions` - Get buyer transactions
- `POST /api/buyer/transactions/:transactionId/complete` - Complete transaction
- `POST /api/buyer/transactions/:transactionId/cancel` - Cancel transaction

### Government Routes
- `GET /api/government/transactions/pending` - Get pending transactions
- `GET /api/government/transactions` - Get all transactions
- `GET /api/government/transactions/:transactionId` - Get transaction details
- `POST /api/government/transactions/:transactionId/review` - Approve/reject
- `GET /api/government/users` - Get all users
- `POST /api/government/users/:userId/status` - Update user status

### Blockchain Routes
- `GET /api/blockchain/transaction/:transactionId/metamask` - Get MetaMask transaction data
- `POST /api/blockchain/transaction/:transactionId/confirm` - Confirm blockchain transaction
- `GET /api/blockchain/status/:txHash` - Get transaction status

## Transaction Flow

1. **Seller** creates electricity units listing
2. **Buyer** browses units and creates purchase request
3. **Seller** accepts/rejects the request
4. **Government** reviews and approves/rejects transaction
5. **Buyer** completes payment via MetaMask (smart contract deployment)
6. Transaction marked as completed, electricity units transferred

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **MetaMask Not Detected**
   - Install MetaMask extension
   - Refresh browser page

3. **Blockchain Connection Error**
   - Ensure Ganache is running on port 8545
   - Check BLOCKCHAIN_NODE_URL in .env

4. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Ensure frontend runs on http://localhost:3000

5. **Smart Contract Deployment Fails**
   - Check Ganache is running
   - Ensure accounts have sufficient ETH
   - Verify contract compilation

### Logs and Debugging
- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser console (F12)
- MongoDB logs: Check MongoDB service logs
- Blockchain logs: Check Ganache terminal output

## Security Notes
- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Implement proper input validation
- Add rate limiting for production
- Use HTTPS in production
- Regularly update dependencies

## Production Deployment
- Use MongoDB Atlas or managed MongoDB
- Deploy to cloud providers (AWS, Heroku, etc.)
- Use mainnet or testnet for blockchain
- Implement proper logging and monitoring
- Add SSL certificates
- Configure proper CORS origins
