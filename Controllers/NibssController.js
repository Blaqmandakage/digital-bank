// const nibssService = require("../Services/nibssService");
// const Account = require("../Models/Account");
// const Transaction = require("../Models/Transactions");



// // ======================================================
// // CREATE BANK ACCOUNT
// // ======================================================
// // CREATE BANK ACCOUNT
// exports.createAccount = async (req, res) => {
//     try {
//         const customer = req.customer;

//         // Customer must have a BVN
//         if (!customer.bvn) {
//             return res.status(400).json({
//                 message: "Please register your BVN first"
//             });
//         }

//         // BVN must be validated before account creation
//         if (!customer.isVerified) {
//             return res.status(400).json({
//                 message: "Please validate your BVN first"
//             });
//         }

//         // Check if the customer already has a local account
//         const existingLocalAccount = await Account.findOne({
//             customer: customer._id
//         });

//         if (existingLocalAccount) {
//             return res.status(200).json({
//                 message: "Customer already has an account",
//                 data: existingLocalAccount
//             });
//         }

//         /*
//          * IMPORTANT:
//          * Before creating a new account at NIBSS,
//          * check whether NIBSS already created one for this BVN.
//          *
//          * This prevents the "bvn already linked to an account"
//          * problem when the NIBSS account exists but MongoDB
//          * was not saved successfully.
//          */
//         const nibssAccountsResponse =
//             await nibssService.getAllAccounts();

//         const nibssAccounts =
//             nibssAccountsResponse?.data?.accounts ||
//             nibssAccountsResponse?.accounts ||
//             [];

//         const existingNibssAccount = nibssAccounts.find(
//             (account) =>
//                 String(account.kycID) === String(customer.bvn) &&
//                 String(account.kycType).toLowerCase() === "bvn"
//         );

//         /*
//          * If the account already exists at NIBSS,
//          * synchronize it into our local database.
//          */
//         if (existingNibssAccount) {
//             const syncedAccount = await Account.create({
//                 customer: customer._id,
//                 accountNumber: existingNibssAccount.accountNumber,
//                 accountName:
//                     existingNibssAccount.accountName ||
//                     `${customer.firstName} ${customer.lastName}`,
//                 bankCode: existingNibssAccount.bankCode || null,
//                 bankName: existingNibssAccount.bankName || null,
//                 balance:
//                     existingNibssAccount.balance ?? 0,
//                 kycType: "bvn",
//                 kycID: customer.bvn
//             });

//             return res.status(200).json({
//                 message: "Existing account synchronized successfully",
//                 data: syncedAccount
//             });
//         }

//         /*
//          * NIBSS does not have an account for this BVN,
//          * so create a new one.
//          */
//         const result = await nibssService.createAccount(
//             "bvn",
//             customer.bvn,
//             customer.dob
//         );

//         console.log(
//             "NIBSS CREATE ACCOUNT RESPONSE:",
//             JSON.stringify(result, null, 2)
//         );

//         if (!result?.accountNumber) {
//             return res.status(500).json({
//                 message: "NIBSS did not return account number"
//             });
//         }

//         // Save the newly created NIBSS account locally
//         const account = await Account.create({
//             customer: customer._id,
//             accountNumber: result.accountNumber,
//             accountName:
//                 `${customer.firstName} ${customer.lastName}`,
//             bankCode: result.bankCode || null,
//             bankName: result.bankName || null,
//             balance: result.balance ?? 0,
//             kycType: "bvn",
//             kycID: customer.bvn
//         });

//         return res.status(201).json({
//             message: "Account created successfully",
//             data: account
//         });

//     } catch (error) {
//         console.error(
//             "Create account error:",
//             error.response?.data || error.message
//         );

//         return res.status(
//             error.response?.status || 500
//         ).json({
//             message:
//                 error.response?.data?.message ||
//                 "Failed to create account"
//         });
//     }
// };


// // ======================================================
// // GET MY ACCOUNTS
// // ======================================================

// exports.getMyAccounts = async (req, res) => {
//   try {
//     const accounts = await Account.find({
//       customer: req.customer._id,
//     });

//     return res.status(200).json({
//       message: "Customer accounts retrieved successfully",
//       count: accounts.length,
//       data: accounts,
//     });
//   } catch (error) {
//     console.error("Get my accounts error:", error.message);

//     return res.status(500).json({
//       message: "Failed to retrieve customer accounts",
//     });
//   }
// };

// // ======================================================
// // GET ALL ACCOUNTS
// // BACKEND / STAFF USE
// // ======================================================

// exports.getAllAccounts = async (req, res) => {
//     try {
//         const result = await nibssService.getAllAccounts();

//         console.log(
//             "NIBSS ALL ACCOUNTS RESPONSE:",
//             JSON.stringify(result, null, 2)
//         );

//         return res.status(200).json({
//             message: "All accounts retrieved successfully",
//             data: result,
//         });

//     } catch (error) {
//         console.error(
//             "Get all accounts error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             message: "Failed to retrieve all accounts",
//         });
//     }
// };

// // ======================================================
// // INSERT BVN
// // ======================================================

// exports.insertBvn = async (req, res) => {
//   try {
//     const { bvn } = req.body;

//     if (!bvn) {
//       return res.status(400).json({
//         message: "BVN is required",
//       });
//     }

//     // Customer cannot register another BVN
//     if (req.customer.bvn) {
//       return res.status(409).json({
//         message: "Customer already has a BVN registered",
//       });
//     }

//     /*
//      * Identity information comes directly from
//      * the authenticated customer.
//      *
//      * The frontend does not send:
//      * - firstName
//      * - lastName
//      * - dob
//      * - phone
//      * - NIBSS token
//      */

//     const customerFirstName = req.customer.firstName;

//     const customerLastName = req.customer.lastName;

//     const customerDob = req.customer.dob;

//     const customerPhone = req.customer.phone;

//     /*
//      * The NIBSS token is handled internally
//      * by nibssService.
//      */
//     const result = await nibssService.insertBvn(
//       bvn,
//       customerFirstName,
//       customerLastName,
//       customerDob,
//       customerPhone,
//     );
//     console.log("NIBSS INSERT BVN RESPONSE:", result);

//     // Save BVN against authenticated customer
//     req.customer.bvn = bvn;

//     await req.customer.save();

//     return res.status(200).json({
//       message: "BVN registered successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//         "Insert BVN error:",
//         error.response?.data || error.message
//     );

//     return res.status(
//         error.response?.status || 500
//     ).json({
//         message:
//             error.response?.data?.message ||
//             "Failed to register BVN",
//     });
// }
// };

// // ======================================================
// // VALIDATE BVN
// // ======================================================

// exports.validateBvn = async (req, res) => {
//   try {
//     const { bvn } = req.body;

//     if (!bvn) {
//       return res.status(400).json({
//         message: "BVN is required",
//       });
//     }

//     if (!req.customer.bvn) {
//       return res.status(400).json({
//         message: "Please register your BVN first",
//       });
//     }

//     if (req.customer.bvn !== bvn) {
//       return res.status(400).json({
//         message: "BVN does not match the registered BVN",
//       });
//     }

//     if (req.customer.isVerified) {
//       return res.status(409).json({
//         message: "Customer BVN is already verified",
//       });
//     }

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.validateBvn(bvn);

//     req.customer.isVerified = true;

//     await req.customer.save();

//     return res.status(200).json({
//       message: "BVN validated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Validate BVN error:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Failed to validate BVN",
//     });
//   }
// };

// // ======================================================
// // ACCOUNT NAME ENQUIRY
// // ======================================================

// exports.nameEnquiry = async (req, res) => {
//   try {
//     const { accountNo } = req.body;

//     if (!accountNo) {
//       return res.status(400).json({
//         message: "Account number is required",
//       });
//     }

//     /*
//      * NIBSS authentication is handled internally.
//      */
//     const result = await nibssService.nameEnquiry(accountNo);

//     return res.status(200).json({
//       message: "Account name enquiry successful",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Name enquiry error:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Failed to perform account name enquiry",
//     });
//   }
// };

// // ======================================================
// // TRANSFER
// // ======================================================

// exports.transfer = async (req, res) => {
//   try {
//     const { from, to, amount } = req.body;

//     if (!from || !to || amount === undefined) {
//       return res.status(400).json({
//         message: "From account, destination account and amount are required",
//       });
//     }

//     if (Number(amount) <= 0) {
//       return res.status(400).json({
//         message: "Amount must be greater than 0",
//       });
//     }

//     // Sender must belong to authenticated customer
//     const senderAccount = await Account.findOne({
//       accountNumber: from,
//       customer: req.customer._id,
//     });

//     if (!senderAccount) {
//       return res.status(403).json({
//         message: "You are not authorized to transfer from this account",
//       });
//     }

//     // Recipient must exist
//     const receiverAccount = await Account.findOne({
//       accountNumber: to,
//     });

//     if (!receiverAccount) {
//       return res.status(404).json({
//         message: "Recipient account not found",
//       });
//     }

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.transfer(from, to, Number(amount));

//     const transactionReference =
//       result.transactionId || result.reference || `TXN-${Date.now()}`;

//     const transaction = await Transaction.create({
//       senderAccount: senderAccount._id,
//       receiverAccount: receiverAccount._id,
//       amount: Number(amount),
//       type: "transfer",
//       status: "successful",
//       reference: transactionReference,
//       description: `Transfer from ${from} to ${to}`,
//     });

//     return res.status(200).json({
//       message: "Transfer successful",
//       data: {
//         nibss: result,
//         transaction,
//       },
//     });
//   } catch (error) {
//     console.error("Transfer error:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Failed to transfer funds",
//     });
//   }
// };

// // ======================================================
// // TRANSFER STATUS
// // ======================================================

// exports.getTransferStatus = async (req, res) => {
//   try {
//     const { transactionId } = req.body;

//     if (!transactionId) {
//       return res.status(400).json({
//         message: "Transaction ID is required",
//       });
//     }

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.getTransferStatus(transactionId);

//     return res.status(200).json({
//       message: "Transfer status retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "Transfer status error:",
//       error.response?.data || error.message,
//     );

//     return res.status(500).json({
//       message: "Failed to retrieve transfer status",
//     });
//   }
// };

// // ======================================================
// // ACCOUNT BALANCE
// // CUSTOMER
// // ======================================================

// exports.getAccountBalance = async (req, res) => {
//   try {
//     const { accountNumber } = req.body;

//     if (!accountNumber) {
//       return res.status(400).json({
//         message: "Account number is required",
//       });
//     }

//     // Customer can only see their own account balance
//     const account = await Account.findOne({
//       accountNumber,
//       customer: req.customer._id,
//     });

//     if (!account) {
//       return res.status(403).json({
//         message: "You are not authorized to access this account",
//       });
//     }

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.getAccountBalance(accountNumber);

//     return res.status(200).json({
//       message: "Account balance retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "Account balance error:",
//       error.response?.data || error.message,
//     );

//     return res.status(500).json({
//       message: "Failed to retrieve account balance",
//     });
//   }
// };

// // ======================================================
// // INSERT NIN
// // ======================================================

// exports.insertNin = async (req, res) => {
//   try {
//     const { nin } = req.body;

//     if (!nin) {
//       return res.status(400).json({
//         message: "NIN is required",
//       });
//     }

//     if (req.customer.nin) {
//       return res.status(409).json({
//         message: "Customer already has a NIN registered",
//       });
//     }

//     /*
//      * Identity information comes from the
//      * authenticated customer.
//      *
//      * The frontend only sends the NIN.
//      */
//     const customerFirstName = req.customer.firstName;

//     const customerLastName = req.customer.lastName;

//     const customerDob = req.customer.dob;

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.insertNin(
//       nin,
//       customerFirstName,
//       customerLastName,
//       customerDob,
//     );

//     req.customer.nin = nin;

//     await req.customer.save();

//     return res.status(200).json({
//       message: "NIN registered successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Insert NIN error:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Failed to register NIN",
//     });
//   }
// };

// // ======================================================
// // VALIDATE NIN
// // ======================================================

// exports.validateNin = async (req, res) => {
//   try {
//     const { nin } = req.body;

//     if (!nin) {
//       return res.status(400).json({
//         message: "NIN is required",
//       });
//     }

//     if (!req.customer.nin) {
//       return res.status(400).json({
//         message: "Please register your NIN first",
//       });
//     }

//     if (req.customer.nin !== nin) {
//       return res.status(400).json({
//         message: "NIN does not match the registered NIN",
//       });
//     }

//     /*
//      * NIBSS token is handled internally.
//      */
//     const result = await nibssService.validateNin(nin);

//     return res.status(200).json({
//       message: "NIN validated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Validate NIN error:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Failed to validate NIN",
//     });
//   }
// };

const nibssService = require("../Services/nibssService");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transactions");



// ======================================================
// CREATE BANK ACCOUNT
// ======================================================
// CREATE BANK ACCOUNT
exports.createAccount = async (req, res) => {
    try {
        const customer = req.customer;

        // Customer must have a BVN
        if (!customer.bvn) {
            return res.status(400).json({
                message: "Please register your BVN first"
            });
        }

        // BVN must be validated before account creation
        if (!customer.isVerified) {
            return res.status(400).json({
                message: "Please validate your BVN first"
            });
        }

        // Check if the customer already has a local account
        const existingLocalAccount = await Account.findOne({
            customer: customer._id
        });

        if (existingLocalAccount) {
            return res.status(200).json({
                message: "Customer already has an account",
                data: existingLocalAccount
            });
        }

        /*
         * IMPORTANT:
         * Before creating a new account at NIBSS,
         * check whether NIBSS already created one for this BVN.
         *
         * This prevents the "bvn already linked to an account"
         * problem when the NIBSS account exists but MongoDB
         * was not saved successfully.
         */
        const nibssAccountsResponse =
            await nibssService.getAllAccounts();

        const nibssAccounts =
            nibssAccountsResponse?.data?.accounts ||
            nibssAccountsResponse?.accounts ||
            [];

        const existingNibssAccount = nibssAccounts.find(
            (account) =>
                String(account.kycID) === String(customer.bvn) &&
                String(account.kycType).toLowerCase() === "bvn"
        );

        /*
         * If the account already exists at NIBSS,
         * synchronize it into our local database.
         */
        if (existingNibssAccount) {
            const syncedAccount = await Account.create({
                customer: customer._id,
                accountNumber: existingNibssAccount.accountNumber,
                accountName:
                    existingNibssAccount.accountName ||
                    `${customer.firstName} ${customer.lastName}`,
                bankCode: existingNibssAccount.bankCode || null,
                bankName: existingNibssAccount.bankName || null,
                balance:
                    existingNibssAccount.balance ?? 0,
                kycType: "bvn",
                kycID: customer.bvn
            });

            return res.status(200).json({
                message: "Existing account synchronized successfully",
                data: syncedAccount
            });
        }

        /*
         * NIBSS does not have an account for this BVN,
         * so create a new one.
         */
        const result = await nibssService.createAccount(
            "bvn",
            customer.bvn,
            customer.dob
        );

        console.log(
            "NIBSS CREATE ACCOUNT RESPONSE:",
            JSON.stringify(result, null, 2)
        );

        if (!result?.accountNumber) {
            return res.status(500).json({
                message: "NIBSS did not return account number"
            });
        }

        // Save the newly created NIBSS account locally
        const account = await Account.create({
            customer: customer._id,
            accountNumber: result.accountNumber,
            accountName:
                `${customer.firstName} ${customer.lastName}`,
            bankCode: result.bankCode || null,
            bankName: result.bankName || null,
            balance: result.balance ?? 0,
            kycType: "bvn",
            kycID: customer.bvn
        });

        return res.status(201).json({
            message: "Account created successfully",
            data: account
        });

    } catch (error) {
        console.error(
            "Create account error:",
            error.response?.data || error.message
        );

        return res.status(
            error.response?.status || 500
        ).json({
            message:
                error.response?.data?.message ||
                "Failed to create account"
        });
    }
};


// ======================================================
// GET MY ACCOUNTS
// ======================================================

exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      customer: req.customer._id,
    });

    return res.status(200).json({
      message: "Customer accounts retrieved successfully",
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error("Get my accounts error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve customer accounts",
    });
  }
};

// ======================================================
// GET ALL ACCOUNTS
// BACKEND / STAFF USE
// ======================================================

exports.getAllAccounts = async (req, res) => {
    try {
        const result = await nibssService.getAllAccounts();

        console.log(
            "NIBSS ALL ACCOUNTS RESPONSE:",
            JSON.stringify(result, null, 2)
        );

        return res.status(200).json({
            message: "All accounts retrieved successfully",
            data: result,
        });

    } catch (error) {
        console.error(
            "Get all accounts error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to retrieve all accounts",
        });
    }
};

// ======================================================
// INSERT BVN
// ======================================================

exports.insertBvn = async (req, res) => {
  try {
    const { bvn } = req.body;

    if (!bvn) {
      return res.status(400).json({
        message: "BVN is required",
      });
    }

    // Customer cannot register another BVN
    if (req.customer.bvn) {
      return res.status(409).json({
        message: "Customer already has a BVN registered",
      });
    }

    /*
     * Identity information comes directly from
     * the authenticated customer.
     *
     * The frontend does not send:
     * - firstName
     * - lastName
     * - dob
     * - phone
     * - NIBSS token
     */

    const customerFirstName = req.customer.firstName;

    const customerLastName = req.customer.lastName;

    const customerDob = req.customer.dob;

    const customerPhone = req.customer.phone;

    /*
     * The NIBSS token is handled internally
     * by nibssService.
     */
    const result = await nibssService.insertBvn(
      bvn,
      customerFirstName,
      customerLastName,
      customerDob,
      customerPhone,
    );
    console.log("NIBSS INSERT BVN RESPONSE:", result);

    // Save BVN against authenticated customer
    req.customer.bvn = bvn;

    await req.customer.save();

    return res.status(200).json({
      message: "BVN registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(
        "Insert BVN error:",
        error.response?.data || error.message
    );

    return res.status(
        error.response?.status || 500
    ).json({
        message:
            error.response?.data?.message ||
            "Failed to register BVN",
    });
}
};

// ======================================================
// VALIDATE BVN
// ======================================================

exports.validateBvn = async (req, res) => {
  try {
    const { bvn } = req.body;

    if (!bvn) {
      return res.status(400).json({
        message: "BVN is required",
      });
    }

    if (!req.customer.bvn) {
      return res.status(400).json({
        message: "Please register your BVN first",
      });
    }

    if (req.customer.bvn !== bvn) {
      return res.status(400).json({
        message: "BVN does not match the registered BVN",
      });
    }

    if (req.customer.isVerified) {
      return res.status(409).json({
        message: "Customer BVN is already verified",
      });
    }

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.validateBvn(bvn);

    req.customer.isVerified = true;

    await req.customer.save();

    return res.status(200).json({
      message: "BVN validated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Validate BVN error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to validate BVN",
    });
  }
};

// ======================================================
// ACCOUNT NAME ENQUIRY
// ======================================================

exports.nameEnquiry = async (req, res) => {
  try {
    const { accountNo } = req.body;

    if (!accountNo) {
      return res.status(400).json({
        message: "Account number is required",
      });
    }

    /*
     * NIBSS authentication is handled internally.
     */
    const result = await nibssService.nameEnquiry(accountNo);

    return res.status(200).json({
      message: "Account name enquiry successful",
      data: result,
    });
  } catch (error) {
    console.error("Name enquiry error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to perform account name enquiry",
    });
  }
};

// ======================================================
// TRANSFER
// ======================================================

exports.transfer = async (req, res) => {
  try {
    const {
      from,
      to,
      amount,
      transferType,
      recipientBankCode,
      recipientBankName,
      recipientName,
      description,
    } = req.body;

    if (!from || !to || amount === undefined) {
      return res.status(400).json({
        message: "From account, destination account and amount are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Sender must belong to the authenticated customer.
    const senderAccount = await Account.findOne({
      accountNumber: from,
      customer: req.customer._id,
    });

    if (!senderAccount) {
      return res.status(403).json({
        message: "You are not authorized to transfer from this account",
      });
    }

    if (String(from) === String(to)) {
      return res.status(400).json({
        message: "You cannot transfer to your own account",
      });
    }

    // A local recipient means intra-bank. If no local account exists,
    // the transfer can be treated as an inter-bank transfer.
    const receiverAccount = await Account.findOne({
      accountNumber: to,
    });

    const resolvedTransferType = receiverAccount
      ? "intra_bank"
      : transferType === "inter_bank"
        ? "inter_bank"
        : null;

    if (!resolvedTransferType) {
      return res.status(404).json({
        message:
          "Recipient account not found locally. Select inter-bank transfer for an external account.",
      });
    }

    let verifiedRecipientName = recipientName || null;

    // For an external recipient, perform name enquiry before attempting
    // the transfer. The NIBSS service handles the fintech JWT internally.
    if (resolvedTransferType === "inter_bank") {
      if (!recipientBankCode) {
        return res.status(400).json({
          message: "Recipient bank code is required for an inter-bank transfer",
        });
      }

      try {
        const enquiry = await nibssService.nameEnquiry(to);

        verifiedRecipientName =
          enquiry?.accountName ||
          enquiry?.data?.accountName ||
          enquiry?.data?.account?.accountName ||
          enquiry?.name ||
          enquiry?.data?.name ||
          verifiedRecipientName;
      } catch (error) {
        console.error(
          "Inter-bank name enquiry error:",
          error.response?.data || error.message
        );

        return res.status(400).json({
          message: "Unable to verify the external recipient account",
        });
      }

      if (!verifiedRecipientName) {
        return res.status(400).json({
          message: "Recipient account name could not be verified",
        });
      }
    } else if (!verifiedRecipientName) {
      verifiedRecipientName = receiverAccount.accountName;
    }

    /*
     * NIBSS token is handled internally.
     * The simulator's transfer endpoint receives the sender,
     * destination account and amount. It can therefore handle
     * both local and external destinations without exposing the
     * NIBSS fintech token to the frontend.
     */
    const result = await nibssService.transfer(
      from,
      to,
      Number(amount)
    );

    const transactionReference =
      result.transactionId || result.reference || `TXN-${Date.now()}`;

    const transaction = await Transaction.create({
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount?._id || null,
      recipientAccountNumber: to,
      recipientName: verifiedRecipientName,
      recipientBankCode:
        resolvedTransferType === "inter_bank"
          ? recipientBankCode
          : receiverAccount.bankCode || null,
      recipientBankName:
        resolvedTransferType === "inter_bank"
          ? recipientBankName || null
          : receiverAccount.bankName || null,
      transferType: resolvedTransferType,
      amount: Number(amount),
      type: "transfer",
      status: "successful",
      reference: transactionReference,
      description:
        description || `Transfer from ${from} to ${to}`,
    });

    return res.status(200).json({
      message: "Transfer successful",
      data: {
        transferType: resolvedTransferType,
        recipient: {
          accountNumber: to,
          accountName: verifiedRecipientName,
          bankCode: transaction.recipientBankCode,
          bankName: transaction.recipientBankName,
        },
        nibss: result,
        transaction,
      },
    });
  } catch (error) {
    console.error("Transfer error:", error.response?.data || error.message);

    return res.status(
      error.response?.status || 500
    ).json({
      message:
        error.response?.data?.message ||
        "Failed to transfer funds",
    });
  }
};

// ======================================================
// TRANSFER STATUS
// ======================================================

exports.getTransferStatus = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        message: "Transaction ID is required",
      });
    }

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.getTransferStatus(transactionId);

    return res.status(200).json({
      message: "Transfer status retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Transfer status error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Failed to retrieve transfer status",
    });
  }
};

// ======================================================
// ACCOUNT BALANCE
// CUSTOMER
// ======================================================

exports.getAccountBalance = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        message: "Account number is required",
      });
    }

    // Customer can only see their own account balance
    const account = await Account.findOne({
      accountNumber,
      customer: req.customer._id,
    });

    if (!account) {
      return res.status(403).json({
        message: "You are not authorized to access this account",
      });
    }

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.getAccountBalance(accountNumber);

    return res.status(200).json({
      message: "Account balance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Account balance error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Failed to retrieve account balance",
    });
  }
};

// ======================================================
// INSERT NIN
// ======================================================

exports.insertNin = async (req, res) => {
  try {
    const { nin } = req.body;

    if (!nin) {
      return res.status(400).json({
        message: "NIN is required",
      });
    }

    if (req.customer.nin) {
      return res.status(409).json({
        message: "Customer already has a NIN registered",
      });
    }

    /*
     * Identity information comes from the
     * authenticated customer.
     *
     * The frontend only sends the NIN.
     */
    const customerFirstName = req.customer.firstName;

    const customerLastName = req.customer.lastName;

    const customerDob = req.customer.dob;

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.insertNin(
      nin,
      customerFirstName,
      customerLastName,
      customerDob,
    );

    req.customer.nin = nin;

    await req.customer.save();

    return res.status(200).json({
      message: "NIN registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Insert NIN error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to register NIN",
    });
  }
};

// ======================================================
// VALIDATE NIN
// ======================================================

exports.validateNin = async (req, res) => {
  try {
    const { nin } = req.body;

    if (!nin) {
      return res.status(400).json({
        message: "NIN is required",
      });
    }

    if (!req.customer.nin) {
      return res.status(400).json({
        message: "Please register your NIN first",
      });
    }

    if (req.customer.nin !== nin) {
      return res.status(400).json({
        message: "NIN does not match the registered NIN",
      });
    }

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.validateNin(nin);

    return res.status(200).json({
      message: "NIN validated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Validate NIN error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to validate NIN",
    });
  }
};
