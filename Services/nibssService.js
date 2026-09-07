// const axios = require("axios");

// const nibssApi = axios.create({
//     baseURL: "https://nibssbyphoenix.onrender.com"
// });

// //first service to onboard fintech
// exports.onboardFintech = async (name, email) => {
//     const response = await nibssApi.post("/api/fintech/onboard", {
//         name,
//         email
//     });

//     return response.data;
// };

// //second service to get token
// exports.getToken = async (apiKey, apiSecret) => {
//     const response = await nibssApi.post("/api/auth/token", {
//         apiKey,
//         apiSecret
//     });

//     return response.data;
// };
// //third service to create account
// exports.createAccount = async (token, kycType, kycID, dob) => {
//     const response = await nibssApi.post(
//         "/api/account/create",
//         {
//             kycType,
//             kycID,
//             dob
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };
// // Get all accounts function to be called from the route
// exports.getAllAccounts = async (token) => {
//     const response = await nibssApi.get(
//         "/api/accounts",
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// //Validate BVN function to be called from the route
// exports.validateBvn = async (token, bvn) => {
//     const response = await nibssApi.post(
//         "/api/validateBvn",
//         {
//             bvn
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// //Name enquiry function to be called from the route

// exports.nameEnquiry = async (token, accountNo) => {
//     const response = await nibssApi.get(
//         `/api/account/name-enquiry/${accountNo}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// //Transfer function to be called from the route

// exports.transfer = async (token, from, to, amount) => {
//     const response = await nibssApi.post(
//         "/api/transfer",
//         {
//             from,
//             to,
//             amount
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };


// // Insert BVN function to be called from the route

// exports.insertBvn = async (token, bvn, firstName, lastName, dob, phone) => {
//     const response = await nibssApi.post(
//         "/api/insertBvn",
//         {
//             bvn,
//             firstName,
//             lastName,
//             dob,
//             phone
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// // Get transfer status function to be called from the route
// exports.getTransferStatus = async (token, transactionId) => {
//     const response = await nibssApi.get(
//         `/api/transaction/${transactionId}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// // Get account balance function to be called from the route
// exports.getAccountBalance = async (token, accountNumber) => {
//     const response = await nibssApi.get(
//         `/api/account/balance/${accountNumber}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };
// // Insert NIN function to be called from the route
// exports.insertNin = async (token, nin, firstName, lastName, dob) => {
//     const response = await nibssApi.post(
//         "/api/insertNin",
//         {
//             nin,
//             firstName,
//             lastName,
//             dob
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

// // Validate NIN function to be called from the route

// exports.validateNin = async (token, nin) => {
//     const response = await nibssApi.post(
//         "/api/validateNin",
//         {
//             nin
//         },
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     );

//     return response.data;
// };

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

    // Prevent multiple requests for a token at the same time
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
                throw new Error("NIBSS token was not returned");
            }

            cachedToken = token;

            // NIBSS tokens expire after about 1 hour.
            // Refresh slightly before expiry.
            tokenExpiresAt = Date.now() + (55 * 60 * 1000);

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

            console.log("NIBSS token expired. Refreshing token...");

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
// FINTECH ONBOARDING
// ======================================================

exports.onboardFintech = async (name, email) => {

    const response = await nibssApi.post(
        "/api/fintech/onboard",
        {
            name,
            email
        }
    );

    return response.data;
};


// ======================================================
// MANUAL TOKEN FUNCTION
// BACKEND USE ONLY
// ======================================================

exports.getToken = async (apiKey, apiSecret) => {

    const response = await nibssApi.post(
        "/api/auth/token",
        {
            apiKey,
            apiSecret
        }
    );

    return response.data;
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