const mongoose = require('mongoose');

const sellRequestSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    units: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' }
}, {
    timestamps: true
});

sellRequestSchema.index({ status: 1, createdAt: -1 });
sellRequestSchema.index({ sellerId: 1, status: 1 });

module.exports = mongoose.model('SellRequest', sellRequestSchema);


