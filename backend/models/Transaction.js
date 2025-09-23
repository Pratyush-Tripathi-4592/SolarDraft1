const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    electricityUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectricityUnit' },
    // For legacy electricityUnit-based flow
    unitsRequested: { type: Number, min: 0 },
    pricePerUnit: { type: Number, min: 0 },
    totalAmount: { type: Number, min: 0 },
    // For SellRequest-based flow
    units: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
    status: { 
        type: String, 
    enum: ['pending', 'government_review', 'approved', 'rejected', 'completed', 'cancelled', 'sold'], 
        default: 'pending' 
    },
    // Government verification
    governmentVerified: { type: Boolean, default: false },
    governmentVerifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationDate: { type: Date },
    verificationNotes: { type: String },
    
    // Blockchain transaction hashes
    proposalTxHash: { type: String }, // When seller proposes
    verificationTxHash: { type: String }, // When government approves/rejects
    completionTxHash: { type: String }, // When buyer completes
    deployedContractAddress: { type: String }, // Smart contract address
    
    // Additional metadata
    deliveryDate: { type: Date },
    qualityRating: { type: Number, min: 1, max: 5 },
    buyerNotes: { type: String },
    sellerNotes: { type: String },
    
    // Timestamps
    proposedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
