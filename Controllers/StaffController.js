const Staff = require("../Models/Staff");
const bcrypt = require("bcrypt");
const Customer = require("../Models/Customer");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transactions");
const nibssService = require("../Services/nibssService");
const jwt = require("jsonwebtoken");


// ======================================================
// REGISTER STAFF
// ======================================================

exports.registerStaff = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            department
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "firstName, lastName, email, phone and password are required"
            });
        }

        const existingStaff = await Staff.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingStaff) {
            return res.status(409).json({
                message:
                    "Staff with this email or phone already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const staff = await Staff.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: "staff",
            department:
                department || "customer_service"
        });

        return res.status(201).json({
            message: "Staff registered successfully",
            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                department: staff.department,
                isActive: staff.isActive
            }
        });

    } catch (error) {

        console.error(
            "Staff registration error:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to register staff"
        });
    }
};


// ======================================================
// STAFF LOGIN
// ======================================================

exports.loginStaff = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "email and password are required"
            });
        }

        const staff =
            await Staff.findOne({ email });

        if (!staff) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        if (!staff.isActive) {
            return res.status(403).json({
                message:
                    "Staff account is inactive"
            });
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                staff.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: staff._id,
                role: staff.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message:
                "Staff login successful",
            data: {
                token,
                staff: {
                    id: staff._id,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    email: staff.email,
                    phone: staff.phone,
                    role: staff.role,
                    department: staff.department,
                    isActive: staff.isActive
                }
            }
        });

    } catch (error) {

        console.error(
            "Staff login error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to login staff"
        });
    }
};


// ======================================================
// GET ALL CUSTOMERS
// ======================================================

exports.getCustomers = async (req, res) => {
    try {

        const customers =
            await Customer.find()
                .select("-password");

        return res.status(200).json({
            message:
                "Customers retrieved successfully",
            count: customers.length,
            data: customers
        });

    } catch (error) {

        console.error(
            "Get customers error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve customers"
        });
    }
};


// ======================================================
// GET CUSTOMER ACCOUNTS
// ======================================================

exports.getCustomerAccounts = async (
    req,
    res
) => {
    try {

        const { customerId } =
            req.params;

        const accounts =
            await Account.find({
                customer: customerId
            });

        return res.status(200).json({
            message:
                "Customer accounts retrieved successfully",
            count: accounts.length,
            data: accounts
        });

    } catch (error) {

        console.error(
            "Get customer accounts error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve customer accounts"
        });
    }
};


// ======================================================
// GET CUSTOMER TRANSACTIONS
// ======================================================

exports.getCustomerTransactions = async (
    req,
    res
) => {
    try {

        const { customerId } =
            req.params;

        const accounts =
            await Account.find({
                customer: customerId
            });

        if (accounts.length === 0) {
            return res.status(404).json({
                message:
                    "Customer has no accounts"
            });
        }

        const accountIds =
            accounts.map(
                (account) => account._id
            );

        const transactions =
            await Transaction.find({
                $or: [
                    {
                        senderAccount: {
                            $in: accountIds
                        }
                    },
                    {
                        receiverAccount: {
                            $in: accountIds
                        }
                    }
                ]
            })
                .populate("senderAccount")
                .populate("receiverAccount")
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            message:
                "Customer transactions retrieved successfully",
            count: transactions.length,
            data: transactions
        });

    } catch (error) {

        console.error(
            "Get customer transactions error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve customer transactions"
        });
    }
};


// ======================================================
// GET CUSTOMER BALANCE
// ======================================================
//
// Staff/Admin/Super Admin can request a customer's
// balance without providing a NIBSS token.
//
// NIBSS token is handled internally by nibssService.
// ======================================================

exports.getCustomerAccountBalance = async (
    req,
    res
) => {
    try {

        const { customerId } =
            req.params;

        const customer =
            await Customer.findById(
                customerId
            ).select("-password");

        if (!customer) {
            return res.status(404).json({
                message:
                    "Customer not found"
            });
        }

        const accounts =
            await Account.find({
                customer: customerId
            });

        if (accounts.length === 0) {
            return res.status(404).json({
                message:
                    "Customer has no accounts"
            });
        }

        const accountsWithBalances =
            await Promise.all(
                accounts.map(
                    async (account) => {

                        try {

                            const balance =
                                await nibssService
                                    .getAccountBalance(
                                        account.accountNumber
                                    );

                            return {
                                account: account,
                                balance: balance
                            };

                        } catch (error) {

                            console.error(
                                `Balance error for account ${account.accountNumber}:`,
                                error.response?.data ||
                                error.message
                            );

                            return {
                                account: account,
                                balance: null,
                                balanceError:
                                    "Unable to retrieve balance"
                            };
                        }
                    }
                )
            );

        return res.status(200).json({
            message:
                "Customer account balance retrieved successfully",

            customer: {
                id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email
            },

            count: accountsWithBalances.length,

            data: accountsWithBalances
        });

    } catch (error) {

        console.error(
            "Get customer account balance error:",
            error.response?.data ||
            error.message
        );

        return res.status(
            error.response?.status || 500
        ).json({
            message:
                "Failed to retrieve customer account balance"
        });
    }
};


// ======================================================
// GET TRANSACTION BY ID
// ======================================================

exports.getTransactionById = async (
    req,
    res
) => {
    try {

        const { transactionId } =
            req.params;

        const transaction =
            await Transaction.findById(
                transactionId
            )
                .populate("senderAccount")
                .populate("receiverAccount");

        if (!transaction) {
            return res.status(404).json({
                message:
                    "Transaction not found"
            });
        }

        return res.status(200).json({
            message:
                "Transaction retrieved successfully",
            data: transaction
        });

    } catch (error) {

        console.error(
            "Get transaction by ID error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve transaction"
        });
    }
};


// ======================================================
// UPDATE STAFF STATUS
// ======================================================

exports.updateStaffStatus = async (
    req,
    res
) => {
    try {

        const { staffId } =
            req.params;

        const { isActive } =
            req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message:
                    "isActive must be true or false"
            });
        }

        const staff =
            await Staff.findById(staffId);

        if (!staff) {
            return res.status(404).json({
                message:
                    "Staff not found"
            });
        }

        // Nobody can change their own status
        if (
            staff._id.toString() ===
            req.staff._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot change your own account status"
            });
        }

        // Super admin cannot be changed
        if (staff.role === "super_admin") {
            return res.status(403).json({
                message:
                    "The super admin account cannot be deactivated"
            });
        }

        // Only super admin can change admin status
        if (
            staff.role === "admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can change an admin's status"
            });
        }

        staff.isActive = isActive;

        await staff.save();

        return res.status(200).json({
            message:
                `Staff account ${
                    isActive
                        ? "activated"
                        : "deactivated"
                } successfully`,

            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                department: staff.department,
                isActive: staff.isActive
            }
        });

    } catch (error) {

        console.error(
            "Update staff status error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to update staff status"
        });
    }
};


// ======================================================
// GET ALL STAFF
// ======================================================

exports.getStaff = async (
    req,
    res
) => {
    try {

        const staff =
            await Staff.find()
                .select("-password");

        return res.status(200).json({
            message:
                "Staff retrieved successfully",
            count: staff.length,
            data: staff
        });

    } catch (error) {

        console.error(
            "Get staff error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve staff"
        });
    }
};


// ======================================================
// GET STAFF BY ID
// ======================================================

exports.getStaffById = async (
    req,
    res
) => {
    try {

        const { staffId } =
            req.params;

        const staff =
            await Staff.findById(
                staffId
            ).select("-password");

        if (!staff) {
            return res.status(404).json({
                message:
                    "Staff not found"
            });
        }

        return res.status(200).json({
            message:
                "Staff retrieved successfully",
            data: staff
        });

    } catch (error) {

        console.error(
            "Get staff by ID error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to retrieve staff"
        });
    }
};


// ======================================================
// UPDATE STAFF
// ======================================================

exports.updateStaff = async (
    req,
    res
) => {
    try {

        const { staffId } =
            req.params;

        const {
            firstName,
            lastName,
            phone,
            department
        } = req.body;

        const staff =
            await Staff.findById(
                staffId
            );

        if (!staff) {
            return res.status(404).json({
                message:
                    "Staff not found"
            });
        }

        // Nobody can edit themselves
        if (
            staff._id.toString() ===
            req.staff._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot update your own staff account"
            });
        }

        // Ordinary admin cannot edit super admin
        if (
            staff.role === "super_admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can update the super admin account"
            });
        }

        // Ordinary admin cannot edit another admin
        if (
            staff.role === "admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can update an admin"
            });
        }

        if (firstName !== undefined) {
            staff.firstName = firstName;
        }

        if (lastName !== undefined) {
            staff.lastName = lastName;
        }

        if (phone !== undefined) {
            staff.phone = phone;
        }

        if (department !== undefined) {
            staff.department = department;
        }

        await staff.save();

        return res.status(200).json({
            message:
                "Staff updated successfully",

            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                department: staff.department,
                isActive: staff.isActive
            }
        });

    } catch (error) {

        console.error(
            "Update staff error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to update staff"
        });
    }
};


// ======================================================
// UPDATE STAFF ROLE
// ======================================================

exports.updateStaffRole = async (
    req,
    res
) => {
    try {

        const { staffId } =
            req.params;

        const { role } =
            req.body;

        if (
            !["staff", "admin"].includes(role)
        ) {
            return res.status(400).json({
                message:
                    "role must be staff or admin"
            });
        }

        const staff =
            await Staff.findById(
                staffId
            );

        if (!staff) {
            return res.status(404).json({
                message:
                    "Staff not found"
            });
        }

        // Nobody can change their own role
        if (
            staff._id.toString() ===
            req.staff._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot change your own role"
            });
        }

        // Only super admin can assign admin role
        if (
            role === "admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can assign the admin role"
            });
        }

        // Only super admin can change an admin
        if (
            staff.role === "admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can change an admin's role"
            });
        }

        // Super admin cannot be changed
        if (staff.role === "super_admin") {
            return res.status(403).json({
                message:
                    "The super admin role cannot be changed"
            });
        }

        staff.role = role;

        await staff.save();

        return res.status(200).json({
            message:
                "Staff role updated successfully",

            data: {
                id: staff._id,
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                role: staff.role,
                department: staff.department,
                isActive: staff.isActive
            }
        });

    } catch (error) {

        console.error(
            "Update staff role error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to update staff role"
        });
    }
};


// ======================================================
// DELETE STAFF
// ======================================================

exports.deleteStaff = async (
    req,
    res
) => {
    try {

        const { staffId } =
            req.params;

        const staff =
            await Staff.findById(
                staffId
            );

        if (!staff) {
            return res.status(404).json({
                message:
                    "Staff not found"
            });
        }

        // Nobody can delete themselves
        if (
            staff._id.toString() ===
            req.staff._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "You cannot delete your own account"
            });
        }

        // Super admin cannot be deleted
        if (staff.role === "super_admin") {
            return res.status(403).json({
                message:
                    "The super admin cannot be deleted"
            });
        }

        // Ordinary admin cannot delete another admin
        if (
            staff.role === "admin" &&
            req.staff.role !== "super_admin"
        ) {
            return res.status(403).json({
                message:
                    "Only the super admin can delete an admin"
            });
        }

        await Staff.findByIdAndDelete(
            staffId
        );

        return res.status(200).json({
            message:
                "Staff deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete staff error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to delete staff"
        });
    }
};


// ======================================================
// CREATE ADMIN
// SUPER ADMIN ONLY
// ======================================================

exports.createAdmin = async (
    req,
    res
) => {
    try {

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            department
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "firstName, lastName, email, phone and password are required"
            });
        }

        const existingStaff =
            await Staff.findOne({
                $or: [
                    { email },
                    { phone }
                ]
            });

        if (existingStaff) {
            return res.status(409).json({
                message:
                    "Staff with this email or phone already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const admin =
            await Staff.create({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                role: "admin",
                department:
                    department || "management",
                isActive: true
            });

        return res.status(201).json({
            message:
                "Admin created successfully",

            data: {
                id: admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                department: admin.department,
                isActive: admin.isActive
            }
        });

    } catch (error) {

        console.error(
            "Create admin error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Failed to create admin"
        });
    }
};