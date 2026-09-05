const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


//create a new customer
exports.register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            dob,
        } = req.body;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingCustomer) {
            return res.status(400).json({
                message: "Customer already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create customer
        const customer = await Customer.create({
            firstName,
            lastName,
            email,
            phone,
            dob,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Customer registered successfully",
            customer: {
                id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                dob: customer.dob
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


//customer login
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find customer by email
//         const customer = await Customer.findOne({ email });

//         if (!customer) {
//             return res.status(404).json({
//                 message: "Customer not found"
//             });
//         }

//         // Check if password is correct
//         const isMatch = await bcrypt.compare(password, customer.password);

//         if (!isMatch) {
//             return res.status(401).json({
//                 message: "Invalid credentials"
//             });
//         }
//         //jwt token generation
//         const jwt = require("jsonwebtoken");
//         const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
//             expiresIn: "1h"
//         });
//         res.status(200).json({
//             message: "Login successful",
//             customer: {
//                 id: customer._id,
//                 firstName: customer.firstName,
//                 lastName: customer.lastName,
//                 email: customer.email,
//                 phone: customer.phone
//             }
//         });

//     } catch (error) {
//         console.error("Login error:", error);

//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }
// };
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find customer by email
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: customer._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            customer: {
                id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getProfile = async (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        customer: {
            id: req.customer._id,
            firstName: req.customer.firstName,
            lastName: req.customer.lastName,
            email: req.customer.email
        }
    });
};


