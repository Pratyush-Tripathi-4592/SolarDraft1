const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['seller', 'buyer', 'government'], required: true },
    passwordHash: { type: String, required: true },
    blockchainAddress: { type: String, unique: true, sparse: true },
    // Seller specific fields
    electricityUnits: { type: Number, default: 0 }, // Available units
    pricePerUnit: { type: Number, default: 0 }, // Price per kWh
    location: { type: String },
    meterReading: { type: Number, default: 0 },
    // Government specific fields
    governmentId: { type: String, unique: true, sparse: true },
    department: { type: String },
    // Buyer specific fields
    walletBalance: { type: Number, default: 0 },
    // Common fields
    isActive: { type: Boolean, default: true },
    registrationDate: { type: Date, default: Date.now },
    lastLogin: { type: Date }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (this.isModified('passwordHash')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
