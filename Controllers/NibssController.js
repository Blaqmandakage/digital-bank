const nibssService = require("../Services/nibssService");

// Onboard fintech controller function to be called from the route

exports.onboardFintech = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const result = await nibssService.onboardFintech(name, email);

        res.status(201).json({
            message: "Fintech onboarded successfully",
            data: result
        });

    } catch (error) {
        console.error("NIBSS onboarding error:", error);

        res.status(error.response?.status || 500).json({
            message:
                error.response?.data?.message ||
                "Failed to onboard fintech"
        });
    }
};


// Get NIBSS token from the NIBSS API using the provided apiKey and apiSecret function to be called from the route

exports.getToken = async (req, res) => {
    try {
        const { apiKey, apiSecret } = req.body;

        if (!apiKey || !apiSecret) {
            return res.status(400).json({
                message: "apiKey and apiSecret are required"
            });
        }

        const result = await nibssService.getToken(
            apiKey,
            apiSecret
        );

        res.status(200).json({
            message: "NIBSS token generated successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS token error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to generate NIBSS token",
            error: error.response?.data || error.message
        });
    }
};



// Create customer bank account function to be called from the route

exports.createAccount = async (req, res) => {
    try {
        const { token, kycType, kycID, dob } = req.body;

        if (!token || !kycType || !kycID || !dob) {
            return res.status(400).json({
                message: "token, kycType, kycID and dob are required"
            });
        }

        const result = await nibssService.createAccount(
            token,
            kycType,
            kycID,
            dob
        );

        res.status(201).json({
            message: "Account created successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS account creation error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to create account",
            error: error.response?.data || error.message
        });
    }
};

// Get all accounts

exports.getAllAccounts = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "token is required"
            });
        }

        const result = await nibssService.getAllAccounts(token);

        res.status(200).json({
            message: "Accounts retrieved successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS get accounts error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to retrieve accounts",
            error: error.response?.data || error.message
        });
    }
};
// Validate BVN

exports.validateBvn = async (req, res) => {
    try {
        const { token, bvn } = req.body;

        if (!token || !bvn) {
            return res.status(400).json({
                message: "token and bvn are required"
            });
        }

        const result = await nibssService.validateBvn(
            token,
            bvn
        );

        res.status(200).json({
            message: "BVN validated successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS BVN validation error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to validate BVN",
            error: error.response?.data || error.message
        });
    }
};

// Account name enquiry

exports.nameEnquiry = async (req, res) => {
    try {
        const { token, accountNo } = req.body;

        if (!token || !accountNo) {
            return res.status(400).json({
                message: "token and accountNo are required"
            });
        }

        const result = await nibssService.nameEnquiry(
            token,
            accountNo
        );

        res.status(200).json({
            message: "Account name enquiry successful",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS name enquiry error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to perform account name enquiry",
            error: error.response?.data || error.message
        });
    }
};

// Transfer funds

exports.transfer = async (req, res) => {
    try {
        const { token, from, to, amount } = req.body;

        if (!token || !from || !to || !amount) {
            return res.status(400).json({
                message: "token, from, to and amount are required"
            });
        }

        const result = await nibssService.transfer(
            token,
            from,
            to,
            amount
        );

        res.status(200).json({
            message: "Transfer successful",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS transfer error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to transfer funds",
            error: error.response?.data || error.message
        });
    }
};


// Insert BVN

exports.insertBvn = async (req, res) => {
    try {
        const {
            token,
            bvn,
            firstName,
            lastName,
            dob,
            phone
        } = req.body;

        if (!token || !bvn || !firstName || !lastName || !dob || !phone) {
            return res.status(400).json({
                message: "token, bvn, firstName, lastName, dob and phone are required"
            });
        }

        const result = await nibssService.insertBvn(
            token,
            bvn,
            firstName,
            lastName,
            dob,
            phone
        );

        res.status(201).json({
            message: "BVN inserted successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS insert BVN error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to insert BVN",
            error: error.response?.data || error.message
        });
    }
};


// Get transfer status

exports.getTransferStatus = async (req, res) => {
    try {
        const { token, transactionId } = req.body;

        if (!token || !transactionId) {
            return res.status(400).json({
                message: "token and transactionId are required"
            });
        }

        const result = await nibssService.getTransferStatus(
            token,
            transactionId
        );

        res.status(200).json({
            message: "Transfer status retrieved successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "NIBSS transfer status error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to retrieve transfer status",
            error: error.response?.data || error.message
        });
    }
};

// Get account balance
exports.getAccountBalance = async (req, res) => {
    try {
        const { token, accountNumber } = req.body;

        const result = await nibssService.getAccountBalance(
            token,
            accountNumber
        );

        res.status(200).json({
            message: "Account balance retrieved successfully",
            data: result
        });

    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message
        });
    }
};
// Insert NIN function to be called from the route
exports.insertNin = async (req, res) => {
    try {
        const { token, nin, firstName, lastName, dob } = req.body;

        const result = await nibssService.insertNin(
            token,
            nin,
            firstName,
            lastName,
            dob
        );

        res.status(201).json({
            message: "NIN record created successfully",
            data: result
        });

    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message
        });
    }
};
// Validate NIN function to be called from the route
exports.validateNin = async (req, res) => {
    try {
        const { token, nin } = req.body;

        const result = await nibssService.validateNin(
            token,
            nin
        );

        res.status(200).json({
            message: "NIN validated successfully",
            data: result
        });

    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: error.response?.data?.message || error.message
        });
    }
};