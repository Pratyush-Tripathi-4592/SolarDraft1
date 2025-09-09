const mongoose = require('mongoose');

const electricityUnitSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unitsAvailable: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    generationSource: { type: String, enum: ['solar', 'wind', 'hydro', 'thermal', 'other'], required: true },
    location: { type: String, required: true },
    meterReading: { type: Number, required: true },
    qualityCertificate: { type: String }, // Certificate hash or ID
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for efficient querying
electricityUnitSchema.index({ seller: 1, isActive: 1 });
electricityUnitSchema.index({ pricePerUnit: 1, unitsAvailable: 1 });

module.exports = mongoose.model('ElectricityUnit', electricityUnitSchema);
