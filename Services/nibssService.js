const axios = require("axios");

const nibssApi = axios.create({
    baseURL: "https://nibssbyphoenix.onrender.com"
});

//first service to onboard fintech
exports.onboardFintech = async (name, email) => {
    const response = await nibssApi.post("/api/fintech/onboard", {
        name,
        email
    });

    return response.data;
};

//second service to get token
exports.getToken = async (apiKey, apiSecret) => {
    const response = await nibssApi.post("/api/auth/token", {
        apiKey,
        apiSecret
    });

    return response.data;
};
//third service to create account
exports.createAccount = async (token, kycType, kycID, dob) => {
    const response = await nibssApi.post(
        "/api/account/create",
        {
            kycType,
            kycID,
            dob
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
// Get all accounts function to be called from the route
exports.getAllAccounts = async (token) => {
    const response = await nibssApi.get(
        "/api/accounts",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//Validate BVN function to be called from the route
exports.validateBvn = async (token, bvn) => {
    const response = await nibssApi.post(
        "/api/validateBvn",
        {
            bvn
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//Name enquiry function to be called from the route

exports.nameEnquiry = async (token, accountNo) => {
    const response = await nibssApi.get(
        `/api/account/name-enquiry/${accountNo}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//Transfer function to be called from the route

exports.transfer = async (token, from, to, amount) => {
    const response = await nibssApi.post(
        "/api/transfer",
        {
            from,
            to,
            amount
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// Insert BVN function to be called from the route

exports.insertBvn = async (token, bvn, firstName, lastName, dob, phone) => {
    const response = await nibssApi.post(
        "/api/insertBvn",
        {
            bvn,
            firstName,
            lastName,
            dob,
            phone
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Get transfer status function to be called from the route
exports.getTransferStatus = async (token, transactionId) => {
    const response = await nibssApi.get(
        `/api/transaction/${transactionId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Get account balance function to be called from the route
exports.getAccountBalance = async (token, accountNumber) => {
    const response = await nibssApi.get(
        `/api/account/balance/${accountNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
// Insert NIN function to be called from the route
exports.insertNin = async (token, nin, firstName, lastName, dob) => {
    const response = await nibssApi.post(
        "/api/insertNin",
        {
            nin,
            firstName,
            lastName,
            dob
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Validate NIN function to be called from the route

exports.validateNin = async (token, nin) => {
    const response = await nibssApi.post(
        "/api/validateNin",
        {
            nin
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};