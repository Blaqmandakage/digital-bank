const nibssService = require("../Services/nibssService");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transactions");

// Onboard fintech controller function to be called from the route

exports.onboardFintech = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const result = await nibssService.onboardFintech(name, email);

    res.status(201).json({
      message: "Fintech onboarded successfully",
      data: result,
    });
  } catch (error) {
    console.error("NIBSS onboarding error:", error);

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Failed to onboard fintech",
    });
  }
};

// Get NIBSS token from the NIBSS API using the provided apiKey and apiSecret function to be called from the route

exports.getToken = async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.body;

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        message: "apiKey and apiSecret are required",
      });
    }

    const result = await nibssService.getToken(apiKey, apiSecret);

    res.status(200).json({
      message: "NIBSS token generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("NIBSS token error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to generate NIBSS token",
      error: error.response?.data || error.message,
    });
  }
};

// Create customer bank account function to be called from the route
exports.createAccount = async (req, res) => {
  try {
    const { token, kycType, kycID, dob } = req.body;

    if (!token || !kycType || !kycID || !dob) {
      return res.status(400).json({
        message: "token, kycType, kycID and dob are required",
      });
    }

    // 1. Create account on NIBSS
    const result = await nibssService.createAccount(token, kycType, kycID, dob);

    console.log("NIBSS ACCOUNT RESULT:", result);

    const nibssAccount = result.account;

    const customerNames = [req.customer.firstName, req.customer.lastName].map(
      (name) => name.toLowerCase(),
    );

    const accountName = nibssAccount.accountName.toLowerCase();

    const nameMatches = customerNames.every((name) =>
      accountName.includes(name),
    );

    if (!nameMatches) {
      return res.status(400).json({
        message: "Customer name does not match account name",
      });
    }

    // 4. Save the account in our MongoDB
    const account = await Account.create({
      customer: req.customer._id,
      accountNumber: nibssAccount.accountNumber,
      accountName: nibssAccount.accountName,
      bankCode: nibssAccount.bankCode,
      bankName: "Phoenix Bank",
      kycType: nibssAccount.kycType,
      kycID: nibssAccount.kycID,
    });

    res.status(201).json({
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS account creation error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to create account",
      error: error.response?.data || error.message,
    });
  }
};

// Get logged-in customer's accounts
exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      customer: req.customer._id,
    });

    res.status(200).json({
      message: "Customer accounts retrieved successfully",
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error("Get customer accounts error:", error);

    res.status(500).json({
      message: "Failed to retrieve customer accounts",
      error: error.message,
    });
  }
};

// Get all accounts

exports.getAllAccounts = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "token is required",
      });
    }

    const result = await nibssService.getAllAccounts(token);

    res.status(200).json({
      message: "Accounts retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS get accounts error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to retrieve accounts",
      error: error.response?.data || error.message,
    });
  }
};
// Validate BVN
exports.validateBvn = async (req, res) => {
  try {
    const { token, bvn } = req.body;

    if (!token || !bvn) {
      return res.status(400).json({
        message: "token and bvn are required",
      });
    }

    const result = await nibssService.validateBvn(token, bvn);

    req.customer.bvn = bvn;
    req.customer.isVerified = true;

    await req.customer.save();

    res.status(200).json({
      message: "BVN validated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS BVN validation error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to validate BVN",
      error: error.response?.data || error.message,
    });
  }
};

// Account name enquiry

exports.nameEnquiry = async (req, res) => {
  try {
    const { token, accountNo } = req.body;

    if (!token || !accountNo) {
      return res.status(400).json({
        message: "token and accountNo are required",
      });
    }

    const result = await nibssService.nameEnquiry(token, accountNo);

    res.status(200).json({
      message: "Account name enquiry successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS name enquiry error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to perform account name enquiry",
      error: error.response?.data || error.message,
    });
  }
};

// Transfer funds

exports.transfer = async (req, res) => {
  try {
    const { token, from, to, amount } = req.body;

    if (!token || !from || !to || !amount) {
      return res.status(400).json({
        message: "token, from, to and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Make sure the sender account belongs to the logged-in customer
    const senderAccount = await Account.findOne({
      accountNumber: from,
      customer: req.customer._id,
    });

    if (!senderAccount) {
      return res.status(403).json({
        message: "You are not authorized to transfer from this account",
      });
    }

    // Find the receiver account locally
    const receiverAccount = await Account.findOne({
      accountNumber: to,
    });

    if (!receiverAccount) {
      return res.status(404).json({
        message: "Receiver account not found",
      });
    }

    // Perform the actual transfer through NIBSS
    const result = await nibssService.transfer(token, from, to, amount);

    // Save the successful transfer locally
    const transaction = await Transaction.create({
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount._id,
      amount: amount,
      type: "transfer",
      status: "successful",
      reference: result.reference || result.transactionId,
      description: `Transfer from ${from} to ${to}`,
    });

    res.status(200).json({
      message: "Transfer successful",
      data: {
        nibss: result,
        transaction: transaction,
      },
    });
  } catch (error) {
    console.error(
      "NIBSS transfer error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to transfer funds",
      error: error.response?.data || error.message,
    });
  }
};

// exports.transfer = async (req, res) => {
//   try {
//     const { token, from, to, amount } = req.body;

//     if (!token || !from || !to || !amount) {
//       return res.status(400).json({
//         message: "token, from, to and amount are required",
//       });
//     }

//     const result = await nibssService.transfer(token, from, to, amount);

//     res.status(200).json({
//       message: "Transfer successful",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "NIBSS transfer error:",
//       error.response?.data || error.message,
//     );

//     res.status(error.response?.status || 500).json({
//       message: "Failed to transfer funds",
//       error: error.response?.data || error.message,
//     });
//   }
// };

// Insert BVN

exports.insertBvn = async (req, res) => {
  try {
    const { token, bvn, firstName, lastName, dob, phone } = req.body;

    if (!token || !bvn || !firstName || !lastName || !dob || !phone) {
      return res.status(400).json({
        message: "token, bvn, firstName, lastName, dob and phone are required",
      });
    }

    const result = await nibssService.insertBvn(
      token,
      bvn,
      firstName,
      lastName,
      dob,
      phone,
    );

    res.status(201).json({
      message: "BVN inserted successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS insert BVN error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to insert BVN",
      error: error.response?.data || error.message,
    });
  }
};

// Get transfer status

exports.getTransferStatus = async (req, res) => {
  try {
    const { token, transactionId } = req.body;

    if (!token || !transactionId) {
      return res.status(400).json({
        message: "token and transactionId are required",
      });
    }

    const result = await nibssService.getTransferStatus(token, transactionId);

    res.status(200).json({
      message: "Transfer status retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS transfer status error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to retrieve transfer status",
      error: error.response?.data || error.message,
    });
  }
};

// Get account balance

// exports.getAccountBalance = async (req, res) => {
//     try {
//         const { token, accountNumber } = req.body;

//         if (!token || !accountNumber) {
//             return res.status(400).json({
//                 message: "token and accountNumber are required"
//             });
//         }

//         // Check that this account belongs to the logged-in customer
//         const account = await Account.findOne({
//             accountNumber: accountNumber,
//             customer: req.customer._id
//         });

//         if (!account) {
//             return res.status(403).json({
//                 message: "You are not authorized to access this account"
//             });
//         }

//         // Get balance from NIBSS
//         const result = await nibssService.getAccountBalance(
//             token,
//             accountNumber
//         );

//         res.status(200).json({
//             message: "Account balance retrieved successfully",
//             data: result
//         });

//     } catch (error) {
//         res.status(error.response?.status || 500).json({
//             message: error.response?.data?.message || error.message
//         });
//     }
// };
// Get account balance

// Get account balance
exports.getAccountBalance = async (req, res) => {
  try {
    const { token, accountNumber } = req.body;

    if (!token || !accountNumber) {
      return res.status(400).json({
        message: "token and accountNumber are required",
      });
    }

    // Check that the account belongs to the logged-in customer
    const account = await Account.findOne({
      accountNumber: accountNumber,
      customer: req.customer._id,
    });

    // Account does not belong to this customer
    if (!account) {
      return res.status(403).json({
        message: "You are not authorized to access this account",
      });
    }

    // Get balance from NIBSS
    const result = await nibssService.getAccountBalance(token, accountNumber);

    res.status(200).json({
      message: "Account balance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS account balance error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message,
    });
  }
};
// exports.getAccountBalance = async (req, res) => {
//     try {
//         const {
//             token,
//             accountNumber
//         } = req.body;

//         // Check required fields
//         if (!token || !accountNumber) {
//             return res.status(400).json({
//                 message: "token and accountNumber are required"
//             });
//         }

//         // Get account balance from NIBSS
//         const result = await nibssService.getAccountBalance(
//             token,
//             accountNumber
//         );

//         res.status(200).json({
//             message: "Account balance retrieved successfully",
//             data: result
//         });

//     } catch (error) {
//         console.error(
//             "NIBSS account balance error:",
//             error.response?.data || error.message
//         );

//         res.status(error.response?.status || 500).json({
//             message:
//                 error.response?.data?.message ||
//                 error.message
//         });
//     }
// };

// exports.getAccountBalance = async (req, res) => {
//     try {
//         const { token, accountNumber } = req.body;

//         const result = await nibssService.getAccountBalance(
//             token,
//             accountNumber
//         );

//         res.status(200).json({
//             message: "Account balance retrieved successfully",
//             data: result
//         });

//     } catch (error) {
//         res.status(error.response?.status || 500).json({
//             message: error.response?.data?.message || error.message
//         });
//     }
// };
// Insert NIN function to be called from the route
exports.insertNin = async (req, res) => {
  try {
    const { token, nin, firstName, lastName, dob } = req.body;

    const result = await nibssService.insertNin(
      token,
      nin,
      firstName,
      lastName,
      dob,
    );

    res.status(201).json({
      message: "NIN record created successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message,
    });
  }
};
// Validate NIN function to be called from the route
exports.validateNin = async (req, res) => {
  try {
    const { token, nin } = req.body;

    if (!token || !nin) {
      return res.status(400).json({
        message: "token and nin are required",
      });
    }

    const result = await nibssService.validateNin(token, nin);

    req.customer.nin = nin;
    req.customer.isVerified = true;

    await req.customer.save();

    res.status(200).json({
      message: "NIN validated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "NIBSS NIN validation error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message,
    });
  }
};
// exports.validateNin = async (req, res) => {
//     try {
//         const { token, nin } = req.body;

//         const result = await nibssService.validateNin(
//             token,
//             nin
//         );

//         res.status(200).json({
//             message: "NIN validated successfully",
//             data: result
//         });

//     } catch (error) {
//         res.status(error.response?.status || 500).json({
//             message: error.response?.data?.message || error.message
//         });
//     }
// };
