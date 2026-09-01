const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        bvn: {
            type: String,
            default: null
        },

        nin: {
            type: String,
            default: null
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;