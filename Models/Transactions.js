// const mongoose = require("mongoose");

// const transactionSchema = new mongoose.Schema(
//   {
//     senderAccount: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//     },

//     receiverAccount: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     type: {
//       type: String,
//       enum: ["transfer", "deposit", "withdrawal"],
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["pending", "successful", "failed"],
//       default: "pending",
//     },

//     reference: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     description: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// const Transaction = mongoose.model("Transaction", transactionSchema);

// module.exports = Transaction;

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // Used for intra-bank transfers. It is optional for inter-bank transfers
    // because the external recipient is not stored in our local Account model.
    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    // Keeps the recipient details for both transfer types.
    recipientAccountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    recipientName: {
      type: String,
      default: null,
      trim: true,
    },

    recipientBankCode: {
      type: String,
      default: null,
      trim: true,
    },

    recipientBankName: {
      type: String,
      default: null,
      trim: true,
    },

    // Old transactions remain "intra_bank" by default.
    transferType: {
      type: String,
      enum: ["intra_bank", "inter_bank"],
      default: "intra_bank",
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
