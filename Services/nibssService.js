const axios = require("axios");

const nibssApi = axios.create({
    baseURL: "https://nibssbyphoenix.onrender.com"
});

let cachedToken = null;
let tokenExpiresAt = 0;
let tokenRequest = null;


// ======================================================
// GET NIBSS TOKEN INTERNALLY
// ======================================================

const getInternalToken = async (forceRefresh = false) => {

    // Return cached token if it is still valid
    if (
        !forceRefresh &&
        cachedToken &&
        Date.now() < tokenExpiresAt
    ) {
        return cachedToken;
    }

    // Prevent multiple token requests at the same time
    if (tokenRequest) {
        return tokenRequest;
    }

    tokenRequest = (async () => {

        try {

            const apiKey = process.env.NIBSS_API_KEY;
            const apiSecret = process.env.NIBSS_API_SECRET;

            if (!apiKey || !apiSecret) {
                throw new Error(
                    "NIBSS_API_KEY or NIBSS_API_SECRET is missing"
                );
            }

            const response = await nibssApi.post(
                "/api/auth/token",
                {
                    apiKey,
                    apiSecret
                }
            );

            const token =
                response.data?.token ||
                response.data?.data?.token;

            if (!token) {
                throw new Error(
                    "NIBSS token was not returned"
                );
            }

            cachedToken = token;

            // NIBSS token expires after about 1 hour.
            // Refresh slightly before expiry.
            tokenExpiresAt =
                Date.now() + (55 * 60 * 1000);

            return cachedToken;

        } catch (error) {

            console.error(
                "NIBSS token generation failed:",
                error.response?.data || error.message
            );

            throw error;

        } finally {

            tokenRequest = null;

        }

    })();

    return tokenRequest;
};


// ======================================================
// AUTHENTICATED NIBSS REQUEST
// ======================================================

const authenticatedRequest = async (config) => {

    let token = await getInternalToken();

    try {

        const response = await nibssApi.request({
            ...config,

            headers: {
                ...(config.headers || {}),
                Authorization: `Bearer ${token}`
            }
        });

        return response;

    } catch (error) {

        // If NIBSS says the token has expired,
        // get a fresh token and retry once.
        if (error.response?.status === 401) {

            console.log(
                "NIBSS token expired. Refreshing token..."
            );

            token = await getInternalToken(true);

            const response = await nibssApi.request({
                ...config,

                headers: {
                    ...(config.headers || {}),
                    Authorization: `Bearer ${token}`
                }
            });

            return response;
        }

        throw error;
    }
};


// ======================================================
// CREATE ACCOUNT
// ======================================================

exports.createAccount = async (
    kycType,
    kycID,
    dob
) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/account/create",

        data: {
            kycType,
            kycID,
            dob
        }

    });

    return response.data;
};


// ======================================================
// GET ALL ACCOUNTS
// ======================================================

exports.getAllAccounts = async () => {

    const response = await authenticatedRequest({

        method: "GET",

        url: "/api/accounts"

    });

    return response.data;
};


// ======================================================
// VALIDATE BVN
// ======================================================

exports.validateBvn = async (bvn) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/validateBvn",

        data: {
            bvn
        }

    });

    return response.data;
};


// ======================================================
// NAME ENQUIRY
// ======================================================

exports.nameEnquiry = async (accountNo) => {

    const response = await authenticatedRequest({

        method: "GET",

        url: `/api/account/name-enquiry/${accountNo}`

    });

    return response.data;
};


// ======================================================
// TRANSFER
// ======================================================

exports.transfer = async (
    from,
    to,
    amount
) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/transfer",

        data: {
            from,
            to,
            amount
        }

    });

    return response.data;
};


// ======================================================
// INSERT BVN
// ======================================================

exports.insertBvn = async (
    bvn,
    firstName,
    lastName,
    dob,
    phone
) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/insertBvn",

        data: {
            bvn,
            firstName,
            lastName,
            dob,
            phone
        }

    });

    return response.data;
};


// ======================================================
// TRANSFER STATUS
// ======================================================

exports.getTransferStatus = async (
    transactionId
) => {

    const response = await authenticatedRequest({

        method: "GET",

        url: `/api/transaction/${transactionId}`

    });

    return response.data;
};


// ======================================================
// ACCOUNT BALANCE
// ======================================================

exports.getAccountBalance = async (
    accountNumber
) => {

    const response = await authenticatedRequest({

        method: "GET",

        url: `/api/account/balance/${accountNumber}`

    });

    return response.data;
};


// ======================================================
// INSERT NIN
// ======================================================

exports.insertNin = async (
    nin,
    firstName,
    lastName,
    dob
) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/insertNin",

        data: {
            nin,
            firstName,
            lastName,
            dob
        }

    });

    return response.data;
};


// ======================================================
// VALIDATE NIN
// ======================================================

exports.validateNin = async (nin) => {

    const response = await authenticatedRequest({

        method: "POST",

        url: "/api/validateNin",

        data: {
            nin
        }

    });

    return response.data;
};