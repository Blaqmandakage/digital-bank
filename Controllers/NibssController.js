// const nibssService = require("../Services/nibssService");
// const Account = require("../Models/Account");
// const Transaction = require("../Models/Transactions");

// // Onboard fintech controller function to be called from the route

// exports.onboardFintech = async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({
//         message: "Name and email are required",
//       });
//     }

//     const result = await nibssService.onboardFintech(name, email);

//     res.status(201).json({
//       message: "Fintech onboarded successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("NIBSS onboarding error:", error);

//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || "Failed to onboard fintech",
//     });
//   }
// };

// // Get NIBSS token from the NIBSS API using the provided apiKey and apiSecret function to be called from the route

// exports.getToken = async (req, res) => {
//   try {
//     const { apiKey, apiSecret } = req.body;

//     if (!apiKey || !apiSecret) {
//       return res.status(400).json({
//         message: "apiKey and apiSecret are required",
//       });
//     }

//     const result = await nibssService.getToken(apiKey, apiSecret);

//     res.status(200).json({
//       message: "NIBSS token generated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("NIBSS token error:", error.response?.data || error.message);

//     res.status(error.response?.status || 500).json({
//       message: "Failed to generate NIBSS token",
//       error: error.response?.data || error.message,
//     });
//   }
// };

// // Create customer bank account function to be called from the route

// exports.createAccount = async (req, res) => {
//     try {
//         const { kycType, kycID, dob } = req.body;

//         if (!kycType || !kycID || !dob) {
//             return res.status(400).json({
//                 message: "KYC type, KYC ID and date of birth are required"
//             });
//         }

//         // Prevent the customer from creating another account
//         const existingAccount = await Account.findOne({
//             customer: req.customer._id
//         });

//         if (existingAccount) {
//             return res.status(409).json({
//                 message: "Customer already has a bank account",
//                 account: existingAccount
//             });
//         }

//         // Backend gets the NIBSS token automatically
//         const result = await nibssService.createAccount(
//             kycType,
//             kycID,
//             dob
//         );

//         const nibssAccount = result.account;

//         // Check that the NIBSS account name matches
//         // the authenticated customer's registered name
//         const customerFirstName =
//             req.customer.firstName.toLowerCase();

//         const customerLastName =
//             req.customer.lastName.toLowerCase();

//         const accountName =
//             nibssAccount.accountName.toLowerCase();

//         const nameMatches =
//             accountName.includes(customerFirstName) &&
//             accountName.includes(customerLastName);

//         if (!nameMatches) {
//             return res.status(400).json({
//                 message:
//                     "Account name does not match customer name"
//             });
//         }

//         const account = await Account.create({
//             customer: req.customer._id,
//             accountNumber: nibssAccount.accountNumber,
//             accountName: nibssAccount.accountName,
//             bankCode: nibssAccount.bankCode,
//             bankName: "Phoenix Bank",
//             kycType: nibssAccount.kycType,
//             kycID: nibssAccount.kycID
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

//         return res.status(500).json({
//             message: "Failed to create account"
//         });
//     }
// };

// // Get logged-in customer's accounts
// exports.getMyAccounts = async (req, res) => {
//   try {
//     const accounts = await Account.find({
//       customer: req.customer._id,
//     });

//     res.status(200).json({
//       message: "Customer accounts retrieved successfully",
//       count: accounts.length,
//       data: accounts,
//     });
//   } catch (error) {
//     console.error("Get customer accounts error:", error);

//     res.status(500).json({
//       message: "Failed to retrieve customer accounts",
//       error: error.message,
//     });
//   }
// };

// // Get all accounts

// exports.getAllAccounts = async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         message: "token is required",
//       });
//     }

//     const result = await nibssService.getAllAccounts(token);

//     res.status(200).json({
//       message: "Accounts retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "NIBSS get accounts error:",
//       error.response?.data || error.message,
//     );

//     res.status(error.response?.status || 500).json({
//       message: "Failed to retrieve accounts",
//       error: error.response?.data || error.message,
//     });
//   }
// };
// // Validate BVN
// exports.validateBvn = async (req, res) => {
//     try {
//         const { bvn } = req.body;

//         if (!bvn) {
//             return res.status(400).json({
//                 message: "BVN is required"
//             });
//         }

//         // Make sure the customer has registered this BVN
//         if (!req.customer.bvn) {
//             return res.status(400).json({
//                 message: "Please register your BVN first"
//             });
//         }

//         // Make sure they are validating their own BVN
//         if (req.customer.bvn !== bvn) {
//             return res.status(400).json({
//                 message: "BVN does not match the registered BVN"
//             });
//         }

//         // If already verified, don't validate again
//         if (req.customer.isVerified) {
//             return res.status(409).json({
//                 message: "Customer BVN is already verified"
//             });
//         }

//         // NIBSS token is handled internally by the service
//         const result = await nibssService.validateBvn(bvn);

//         // Mark customer as verified
//         req.customer.isVerified = true;
//         await req.customer.save();

//         return res.status(200).json({
//             message: "BVN validated successfully",
//             data: result
//         });

//     } catch (error) {

//         console.error(
//             "Validate BVN error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             message: "Failed to validate BVN"
//         });
//     }
// };

// // Account name enquiry
// exports.nameEnquiry = async (req, res) => {
//     try {
//         const { accountNo } = req.body;

//         if (!accountNo) {
//             return res.status(400).json({
//                 message: "Account number is required"
//             });
//         }

//         // Backend automatically handles the NIBSS token
//         const result = await nibssService.nameEnquiry(accountNo);

//         return res.status(200).json({
//             message: "Account name enquiry successful",
//             data: result
//         });

//     } catch (error) {

//         console.error(
//             "Name enquiry error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             message: "Failed to perform account name enquiry"
//         });
//     }
// };
// // Transfer funds

// exports.transfer = async (req, res) => {
//     try {
//         const {
//             from,
//             to,
//             amount
//         } = req.body;

//         if (!from || !to || amount === undefined) {
//             return res.status(400).json({
//                 message: "From account, destination account and amount are required"
//             });
//         }

//         if (amount <= 0) {
//             return res.status(400).json({
//                 message: "Amount must be greater than 0"
//             });
//         }

//         // Make sure the sender account belongs to
//         // the authenticated customer
//         const senderAccount = await Account.findOne({
//             accountNumber: from,
//             customer: req.customer._id
//         });

//         if (!senderAccount) {
//             return res.status(403).json({
//                 message:
//                     "You are not authorized to transfer from this account"
//             });
//         }

//         // Check the recipient before transferring
//         const receiverAccount = await Account.findOne({
//             accountNumber: to
//         });

//         if (!receiverAccount) {
//             return res.status(404).json({
//                 message: "Recipient account not found"
//             });
//         }

//         // Backend automatically handles the NIBSS token
//         const result = await nibssService.transfer(
//             from,
//             to,
//             amount
//         );

//         // Save transaction in our database
//         const transaction = await Transaction.create({
//             senderAccount: senderAccount._id,
//             receiverAccount: receiverAccount._id,
//             amount,
//             type: "transfer",
//             status: "successful",
//             reference:
//                 result.transactionId ||
//                 `TXN-${Date.now()}`,
//             description:
//                 `Transfer from ${from} to ${to}`
//         });

//         return res.status(200).json({
//             message: "Transfer successful",
//             data: {
//                 nibss: result,
//                 transaction
//             }
//         });

//     } catch (error) {

//         console.error(
//             "Transfer error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             message: "Failed to transfer funds"
//         });
//     }
// };

// // Insert BVN
// exports.insertBvn = async (req, res) => {
//     try {
//         const {
//             bvn,
//             firstName,
//             lastName,
//             dob,
//             phone
//         } = req.body;

//         if (!bvn || !firstName || !lastName || !dob || !phone) {
//             return res.status(400).json({
//                 message:
//                     "BVN, first name, last name, date of birth and phone are required"
//             });
//         }

//         // Prevent registering another BVN
//         if (req.customer.bvn) {
//             return res.status(409).json({
//                 message: "Customer already has a BVN registered"
//             });
//         }

//         // Make sure the submitted identity matches
//         // the authenticated customer's registered details
//         if (
//             firstName.toLowerCase() !==
//             req.customer.firstName.toLowerCase()
//         ) {
//             return res.status(400).json({
//                 message: "First name does not match customer record"
//             });
//         }

//         if (
//             lastName.toLowerCase() !==
//             req.customer.lastName.toLowerCase()
//         ) {
//             return res.status(400).json({
//                 message: "Last name does not match customer record"
//             });
//         }

//         if (phone !== req.customer.phone) {
//             return res.status(400).json({
//                 message: "Phone number does not match customer record"
//             });
//         }

//         // Backend automatically handles the NIBSS token
//         const result = await nibssService.insertBvn(
//             bvn,
//             firstName,
//             lastName,
//             dob,
//             phone
//         );

//         // Save BVN to the authenticated customer's record
//         req.customer.bvn = bvn;
//         await req.customer.save();

//         return res.status(200).json({
//             message: "BVN registered successfully",
//             data: result
//         });

//     } catch (error) {

//         console.error(
//             "Insert BVN error:",
//             error.response?.data || error.message
//         );

//         return res.status(500).json({
//             message: "Failed to register BVN"
//         });
//     }
// };
// // Get transfer status

// exports.getTransferStatus = async (req, res) => {
//   try {
//     const { token, transactionId } = req.body;

//     if (!token || !transactionId) {
//       return res.status(400).json({
//         message: "token and transactionId are required",
//       });
//     }

//     const result = await nibssService.getTransferStatus(token, transactionId);

//     res.status(200).json({
//       message: "Transfer status retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "NIBSS transfer status error:",
//       error.response?.data || error.message,
//     );

//     res.status(error.response?.status || 500).json({
//       message: "Failed to retrieve transfer status",
//       error: error.response?.data || error.message,
//     });
//   }
// };


// // Get account balance

// // Get account balance
// exports.getAccountBalance = async (req, res) => {
//   try {
//     const { token, accountNumber } = req.body;

//     if (!token || !accountNumber) {
//       return res.status(400).json({
//         message: "token and accountNumber are required",
//       });
//     }

//     // Check that the account belongs to the logged-in customer
//     const account = await Account.findOne({
//       accountNumber: accountNumber,
//       customer: req.customer._id,
//     });

//     // Account does not belong to this customer
//     if (!account) {
//       return res.status(403).json({
//         message: "You are not authorized to access this account",
//       });
//     }

//     // Get balance from NIBSS
//     const result = await nibssService.getAccountBalance(token, accountNumber);

//     res.status(200).json({
//       message: "Account balance retrieved successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "NIBSS account balance error:",
//       error.response?.data || error.message,
//     );

//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || error.message,
//     });
//   }
// };

// // Insert NIN function to be called from the route
// exports.insertNin = async (req, res) => {
//   try {
//     const { token, nin, firstName, lastName, dob } = req.body;

//     const result = await nibssService.insertNin(
//       token,
//       nin,
//       firstName,
//       lastName,
//       dob,
//     );

//     res.status(201).json({
//       message: "NIN record created successfully",
//       data: result,
//     });
//   } catch (error) {
//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || error.message,
//     });
//   }
// };
// // Validate NIN function to be called from the route
// exports.validateNin = async (req, res) => {
//   try {
//     const { token, nin } = req.body;

//     if (!token || !nin) {
//       return res.status(400).json({
//         message: "token and nin are required",
//       });
//     }

//     const result = await nibssService.validateNin(token, nin);

//     req.customer.nin = nin;
//     req.customer.isVerified = true;

//     await req.customer.save();

//     res.status(200).json({
//       message: "NIN validated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "NIBSS NIN validation error:",
//       error.response?.data || error.message,
//     );

//     res.status(error.response?.status || 500).json({
//       message: error.response?.data?.message || error.message,
//     });
//   }
// };


const nibssService = require("../Services/nibssService");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transaction");


// ======================================================
// FINTECH ONBOARDING
// ======================================================

exports.onboardFintech = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const result = await nibssService.onboardFintech(
            name,
            email
        );

        return res.status(200).json({
            message: "Fintech onboarded successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Fintech onboarding error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to onboard fintech"
        });
    }
};


// ======================================================
// GET NIBSS TOKEN
// BACKEND SETUP ONLY
// ======================================================

exports.getToken = async (req, res) => {
    try {
        const apiKey = process.env.NIBSS_API_KEY;
        const apiSecret = process.env.NIBSS_API_SECRET;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({
                message: "NIBSS credentials are not configured"
            });
        }

        const result = await nibssService.getToken(
            apiKey,
            apiSecret
        );

        return res.status(200).json({
            message: "NIBSS token generated successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "NIBSS token error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to generate NIBSS token"
        });
    }
};


// ======================================================
// CREATE BANK ACCOUNT
// ======================================================

exports.createAccount = async (req, res) => {
    try {

        // Customer cannot create another account
        const existingAccount = await Account.findOne({
            customer: req.customer._id
        });

        if (existingAccount) {
            return res.status(409).json({
                message: "Customer already has a bank account",
                data: existingAccount
            });
        }

        /*
         * Use the customer's registered BVN.
         *
         * The customer should not have to type their BVN
         * again after verification.
         */

        if (!req.customer.bvn) {
            return res.status(400).json({
                message: "Please register your BVN first"
            });
        }

        if (!req.customer.isVerified) {
            return res.status(400).json({
                message: "Please verify your BVN first"
            });
        }

        const kycType = "BVN";
        const kycID = req.customer.bvn;
        const dob = req.customer.dob;

        // Backend automatically gets the NIBSS token
        const result = await nibssService.createAccount(
            kycType,
            kycID,
            dob
        );

        const nibssAccount = result.account;

        if (!nibssAccount) {
            return res.status(500).json({
                message: "NIBSS did not return account information"
            });
        }

        // Make sure the account name belongs to the customer
        const customerFirstName =
            req.customer.firstName.toLowerCase();

        const customerLastName =
            req.customer.lastName.toLowerCase();

        const accountName =
            nibssAccount.accountName.toLowerCase();

        const nameMatches =
            accountName.includes(customerFirstName) &&
            accountName.includes(customerLastName);

        if (!nameMatches) {
            return res.status(400).json({
                message:
                    "Account name does not match customer name"
            });
        }

        const account = await Account.create({
            customer: req.customer._id,
            accountNumber: nibssAccount.accountNumber,
            accountName: nibssAccount.accountName,
            bankCode: nibssAccount.bankCode,
            bankName: "Phoenix Bank",
            kycType: nibssAccount.kycType,
            kycID: nibssAccount.kycID
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

        return res.status(500).json({
            message: "Failed to create account"
        });
    }
};


// ======================================================
// GET MY ACCOUNTS
// ======================================================

exports.getMyAccounts = async (req, res) => {
    try {

        const accounts = await Account.find({
            customer: req.customer._id
        });

        return res.status(200).json({
            message: "Customer accounts retrieved successfully",
            count: accounts.length,
            data: accounts
        });

    } catch (error) {

        console.error(
            "Get my accounts error:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to retrieve customer accounts"
        });
    }
};


// ======================================================
// GET ALL ACCOUNTS
// BACKEND / STAFF USE
// ======================================================

exports.getAllAccounts = async (req, res) => {
    try {

        const result =
            await nibssService.getAllAccounts();

        return res.status(200).json({
            message: "All accounts retrieved successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Get all accounts error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to retrieve all accounts"
        });
    }
};


// ======================================================
// INSERT BVN
// ======================================================

exports.insertBvn = async (req, res) => {
    try {

        const {
            bvn,
            firstName,
            lastName,
            dob,
            phone
        } = req.body;

        if (!bvn) {
            return res.status(400).json({
                message: "BVN is required"
            });
        }

        // Customer cannot register another BVN
        if (req.customer.bvn) {
            return res.status(409).json({
                message: "Customer already has a BVN registered"
            });
        }

        /*
         * We use the authenticated customer's information
         * instead of trusting someone else's identity details.
         */

        const customerFirstName =
            req.customer.firstName;

        const customerLastName =
            req.customer.lastName;

        const customerDob =
            req.customer.dob;

        const customerPhone =
            req.customer.phone;

        /*
         * These checks are kept for compatibility if the
         * frontend sends the fields.
         */

        if (
            firstName &&
            firstName.toLowerCase() !==
            customerFirstName.toLowerCase()
        ) {
            return res.status(400).json({
                message: "First name does not match customer record"
            });
        }

        if (
            lastName &&
            lastName.toLowerCase() !==
            customerLastName.toLowerCase()
        ) {
            return res.status(400).json({
                message: "Last name does not match customer record"
            });
        }

        if (
            phone &&
            phone !== customerPhone
        ) {
            return res.status(400).json({
                message: "Phone number does not match customer record"
            });
        }

        const result =
            await nibssService.insertBvn(
                bvn,
                customerFirstName,
                customerLastName,
                customerDob,
                customerPhone
            );

        // Save BVN against authenticated customer
        req.customer.bvn = bvn;

        await req.customer.save();

        return res.status(200).json({
            message: "BVN registered successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Insert BVN error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to register BVN"
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
                message: "BVN is required"
            });
        }

        if (!req.customer.bvn) {
            return res.status(400).json({
                message: "Please register your BVN first"
            });
        }

        if (req.customer.bvn !== bvn) {
            return res.status(400).json({
                message:
                    "BVN does not match the registered BVN"
            });
        }

        if (req.customer.isVerified) {
            return res.status(409).json({
                message: "Customer BVN is already verified"
            });
        }

        const result =
            await nibssService.validateBvn(bvn);

        req.customer.isVerified = true;

        await req.customer.save();

        return res.status(200).json({
            message: "BVN validated successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Validate BVN error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to validate BVN"
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
                message: "Account number is required"
            });
        }

        const result =
            await nibssService.nameEnquiry(
                accountNo
            );

        return res.status(200).json({
            message: "Account name enquiry successful",
            data: result
        });

    } catch (error) {

        console.error(
            "Name enquiry error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to perform account name enquiry"
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
            amount
        } = req.body;

        if (
            !from ||
            !to ||
            amount === undefined
        ) {
            return res.status(400).json({
                message:
                    "From account, destination account and amount are required"
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        // Sender must belong to authenticated customer
        const senderAccount =
            await Account.findOne({
                accountNumber: from,
                customer: req.customer._id
            });

        if (!senderAccount) {
            return res.status(403).json({
                message:
                    "You are not authorized to transfer from this account"
            });
        }

        // Recipient must exist
        const receiverAccount =
            await Account.findOne({
                accountNumber: to
            });

        if (!receiverAccount) {
            return res.status(404).json({
                message: "Recipient account not found"
            });
        }

        const result =
            await nibssService.transfer(
                from,
                to,
                Number(amount)
            );

        /*
         * NIBSS may return transactionId depending on
         * the simulated API response.
         */

        const transactionReference =
            result.transactionId ||
            result.reference ||
            `TXN-${Date.now()}`;

        const transaction =
            await Transaction.create({
                senderAccount: senderAccount._id,
                receiverAccount: receiverAccount._id,
                amount: Number(amount),
                type: "transfer",
                status: "successful",
                reference: transactionReference,
                description:
                    `Transfer from ${from} to ${to}`
            });

        return res.status(200).json({
            message: "Transfer successful",
            data: {
                nibss: result,
                transaction
            }
        });

    } catch (error) {

        console.error(
            "Transfer error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to transfer funds"
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
                message: "Transaction ID is required"
            });
        }

        const result =
            await nibssService.getTransferStatus(
                transactionId
            );

        return res.status(200).json({
            message:
                "Transfer status retrieved successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Transfer status error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve transfer status"
        });
    }
};


// ======================================================
// ACCOUNT BALANCE
// CUSTOMER
// ======================================================

exports.getAccountBalance = async (req, res) => {
    try {

        const { accountNumber } = req.params;

        if (!accountNumber) {
            return res.status(400).json({
                message: "Account number is required"
            });
        }

        // Customer can only see their own account balance
        const account =
            await Account.findOne({
                accountNumber,
                customer: req.customer._id
            });

        if (!account) {
            return res.status(403).json({
                message:
                    "You are not authorized to access this account"
            });
        }

        const result =
            await nibssService.getAccountBalance(
                accountNumber
            );

        return res.status(200).json({
            message:
                "Account balance retrieved successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Account balance error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve account balance"
        });
    }
};


// ======================================================
// INSERT NIN
// ======================================================

exports.insertNin = async (req, res) => {
    try {

        const {
            nin,
            firstName,
            lastName,
            dob
        } = req.body;

        if (!nin) {
            return res.status(400).json({
                message: "NIN is required"
            });
        }

        if (req.customer.nin) {
            return res.status(409).json({
                message:
                    "Customer already has a NIN registered"
            });
        }

        const customerFirstName =
            req.customer.firstName;

        const customerLastName =
            req.customer.lastName;

        const customerDob =
            req.customer.dob;

        if (
            firstName &&
            firstName.toLowerCase() !==
            customerFirstName.toLowerCase()
        ) {
            return res.status(400).json({
                message:
                    "First name does not match customer record"
            });
        }

        if (
            lastName &&
            lastName.toLowerCase() !==
            customerLastName.toLowerCase()
        ) {
            return res.status(400).json({
                message:
                    "Last name does not match customer record"
            });
        }

        const result =
            await nibssService.insertNin(
                nin,
                customerFirstName,
                customerLastName,
                customerDob
            );

        req.customer.nin = nin;

        await req.customer.save();

        return res.status(200).json({
            message: "NIN registered successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Insert NIN error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to register NIN"
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
                message: "NIN is required"
            });
        }

        if (!req.customer.nin) {
            return res.status(400).json({
                message: "Please register your NIN first"
            });
        }

        if (req.customer.nin !== nin) {
            return res.status(400).json({
                message:
                    "NIN does not match the registered NIN"
            });
        }

        const result =
            await nibssService.validateNin(nin);

        return res.status(200).json({
            message: "NIN validated successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Validate NIN error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Failed to validate NIN"
        });
    }
};