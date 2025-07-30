const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['buyer', 'owner', 'government'], required: true },
    passwordHash: { type: String, required: true },
    blockchainAddress: { type: String, unique: true, sparse: true }
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
