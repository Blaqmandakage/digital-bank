const nibssService = require("../Services/nibssService");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transactions");

// ======================================================
// CREATE BANK ACCOUNT
// ======================================================

// CREATE BANK ACCOUNT
// CREATE BANK ACCOUNT
exports.createAccount = async (req, res) => {
    try {
        // Customer must have a BVN
        if (!req.customer.bvn) {
            return res.status(400).json({
                message: "Please register your BVN first"
            });
        }

        // BVN must be validated
        if (!req.customer.isVerified) {
            return res.status(400).json({
                message: "Please validate your BVN first"
            });
        }

        // Customer can only have one account
        const existingAccount = await Account.findOne({
            customer: req.customer._id
        });

        if (!existingAccount) {
            return res.status(400).json({
                message: "Customer already has a bank account"
            });
        }

        // NIBSS expects lowercase "bvn"
        const kycType = "bvn";
        const kycID = req.customer.bvn;
        const dob = req.customer.dob;

        // Create account through NIBSS
        const result = await nibssService.createAccount(
            kycType,
            kycID,
            dob
        );

        // NIBSS returns these fields directly
        const accountNumber = result.accountNumber;
        const accountName = result.accountName;
        const bankCode = result.bankCode;
        const bankName = result.bankName;
        const balance = result.balance;

        if (!accountNumber || !accountName) {
            console.error("Invalid NIBSS account response:", result);

            return res.status(500).json({
                message: "NIBSS did not return account information"
            });
        }

        // Check account name against registered customer name
        const nibssName = accountName.toLowerCase().trim();

        const customerFirstName =
            req.customer.firstName.toLowerCase().trim();

        const customerLastName =
            req.customer.lastName.toLowerCase().trim();

        if (
            !nibssName.includes(customerFirstName) ||
            !nibssName.includes(customerLastName)
        ) {
            return res.status(400).json({
                message: "Account name does not match customer information"
            });
        }

        // Save account locally
        const account = await Account.create({
            customer: req.customer._id,
            accountNumber,
            accountName,
            bankCode: bankCode || null,
            bankName: bankName || null,
            balance: balance ?? 0,
            kycType,
            kycID
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

    return res.status(200).json({
      message: "All accounts retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Get all accounts error:",
      error.response?.data || error.message,
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

    // Save BVN against authenticated customer
    req.customer.bvn = bvn;

    await req.customer.save();

    return res.status(200).json({
      message: "BVN registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Insert BVN error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to register BVN",
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
    const { from, to, amount } = req.body;

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

    // Sender must belong to authenticated customer
    const senderAccount = await Account.findOne({
      accountNumber: from,
      customer: req.customer._id,
    });

    if (!senderAccount) {
      return res.status(403).json({
        message: "You are not authorized to transfer from this account",
      });
    }

    // Recipient must exist
    const receiverAccount = await Account.findOne({
      accountNumber: to,
    });

    if (!receiverAccount) {
      return res.status(404).json({
        message: "Recipient account not found",
      });
    }

    /*
     * NIBSS token is handled internally.
     */
    const result = await nibssService.transfer(from, to, Number(amount));

    const transactionReference =
      result.transactionId || result.reference || `TXN-${Date.now()}`;

    const transaction = await Transaction.create({
      senderAccount: senderAccount._id,
      receiverAccount: receiverAccount._id,
      amount: Number(amount),
      type: "transfer",
      status: "successful",
      reference: transactionReference,
      description: `Transfer from ${from} to ${to}`,
    });

    return res.status(200).json({
      message: "Transfer successful",
      data: {
        nibss: result,
        transaction,
      },
    });
  } catch (error) {
    console.error("Transfer error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to transfer funds",
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
