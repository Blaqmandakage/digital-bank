const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["transfer", "deposit", "withdrawal"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;