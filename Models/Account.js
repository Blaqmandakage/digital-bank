const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        accountNumber: {
            type: String,
            required: true,
            unique: true
        },

        accountName: {
            type: String,
            required: true
        },

        bankCode: {
            type: String,
            default: null
        },

        bankName: {
            type: String,
            default: null
        },

        balance: {
            type: Number,
            default: 0
        },

        kycType: {
            type: String,
            default: null
        },

        kycID: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;