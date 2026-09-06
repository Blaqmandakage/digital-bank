const Staff = require("../Models/Staff");
const bcrypt = require("bcrypt");
const Customer = require("../Models/Customer");
const Account = require("../Models/Account");
const Transaction = require("../Models/Transactions");
const nibssService = require("../Services/nibssService");
const jwt = require("jsonwebtoken");

exports.registerStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, department } =
      req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        message: "firstName, lastName, email, phone and password are required",
      });
    }

    const existingStaff = await Staff.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingStaff) {
      return res.status(409).json({
        message: "Staff with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: "staff",
      department: department || "customer_service",
    });

    res.status(201).json({
      message: "Staff registered successfully",
      data: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    console.error("Staff registration error:", error);

    res.status(500).json({
      message: "Failed to register staff",
      error: error.message,
    });
  }
};

// exports.registerStaff = async (req, res) => {
//   try {
//     const { firstName, lastName, email, phone, password, role, department } =
//       req.body;

//     if (!firstName || !lastName || !email || !phone || !password) {
//       return res.status(400).json({
//         message: "firstName, lastName, email, phone and password are required",
//       });
//     }

//     const existingStaff = await Staff.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingStaff) {
//       return res.status(409).json({
//         message: "Staff with this email or phone already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const staff = await Staff.create({
//       firstName,
//       lastName,
//       email,
//       phone,
//       password: hashedPassword,
//       role: role || "staff",
//       department: department || "customer_service",
//     });

//     res.status(201).json({
//       message: "Staff registered successfully",
//       data: {
//         id: staff._id,
//         firstName: staff.firstName,
//         lastName: staff.lastName,
//         email: staff.email,
//         phone: staff.phone,
//         role: staff.role,
//         department: staff.department,
//         isActive: staff.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Staff registration error:", error);

//     res.status(500).json({
//       message: "Failed to register staff",
//       error: error.message,
//     });
//   }
// };

exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const staff = await Staff.findOne({ email });

    if (!staff) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!staff.isActive) {
      return res.status(403).json({
        message: "Staff account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "Staff login successful",
      data: {
        token,
        staff: {
          id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          isActive: staff.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);

    res.status(500).json({
      message: "Failed to login staff",
      error: error.message,
    });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password");

    res.status(200).json({
      message: "Customers retrieved successfully",
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to retrieve customers",
      error: error.message,
    });
  }
};

exports.getCustomerAccounts = async (req, res) => {
  try {
    const { customerId } = req.params;

    const accounts = await Account.find({
      customer: customerId,
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

exports.getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;

    const accounts = await Account.find({
      customer: customerId,
    });

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "Customer has no accounts",
      });
    }

    const accountIds = accounts.map((account) => account._id);

    const transactions = await Transaction.find({
      $or: [
        { senderAccount: { $in: accountIds } },
        { receiverAccount: { $in: accountIds } },
      ],
    })
      .populate("senderAccount")
      .populate("receiverAccount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customer transactions retrieved successfully",
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get customer transactions error:", error);

    res.status(500).json({
      message: "Failed to retrieve customer transactions",
      error: error.message,
    });
  }
};

exports.getCustomerAccountBalance = async (req, res) => {
  try {
    const { customerId, accountNumber } = req.params;

    const account = await Account.findOne({
      customer: customerId,
      accountNumber: accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        message: "Customer account not found",
      });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "token is required",
      });
    }

    const result = await nibssService.getAccountBalance(token, accountNumber);

    res.status(200).json({
      message: "Customer account balance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Get customer account balance error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to retrieve customer account balance",
      error: error.response?.data || error.message,
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate("senderAccount")
      .populate("receiverAccount");

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction by ID error:", error);

    res.status(500).json({
      message: "Failed to retrieve transaction",
      error: error.message,
    });
  }
};
exports.updateStaffStatus = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    // Nobody can deactivate or activate their own account
    if (staff._id.toString() === req.staff._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own account status",
      });
    }

    // The super admin cannot be deactivated by an admin
    if (staff.role === "super_admin") {
      return res.status(403).json({
        message: "The super admin account cannot be deactivated",
      });
    }

    // An ordinary admin cannot change another admin's status
    if (
      staff.role === "admin" &&
      req.staff.role !== "super_admin"
    ) {
      return res.status(403).json({
        message: "Only the super admin can change an admin's status",
      });
    }

    staff.isActive = isActive;

    await staff.save();

    res.status(200).json({
      message: `Staff account ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    console.error("Update staff status error:", error);

    res.status(500).json({
      message: "Failed to update staff status",
      error: error.message,
    });
  }
};

// exports.updateStaffStatus = async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { isActive } = req.body;

//     if (typeof isActive !== "boolean") {
//       return res.status(400).json({
//         message: "isActive must be true or false",
//       });
//     }

//     const staff = await Staff.findById(staffId);

//     if (!staff) {
//       return res.status(404).json({
//         message: "Staff not found",
//       });
//     }

//     // Prevent an admin from deactivating their own account
//     if (staff._id.toString() === req.staff._id.toString()) {
//       return res.status(400).json({
//         message: "You cannot deactivate your own account",
//       });
//     }

//     staff.isActive = isActive;

//     await staff.save();

//     res.status(200).json({
//       message: `Staff account ${
//         isActive ? "activated" : "deactivated"
//       } successfully`,
//       data: {
//         id: staff._id,
//         firstName: staff.firstName,
//         lastName: staff.lastName,
//         email: staff.email,
//         role: staff.role,
//         department: staff.department,
//         isActive: staff.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Update staff status error:", error);

//     res.status(500).json({
//       message: "Failed to update staff status",
//       error: error.message,
//     });
//   }
// };

// exports.updateStaffStatus = async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { isActive } = req.body;

//     if (typeof isActive !== "boolean") {
//       return res.status(400).json({
//         message: "isActive must be true or false",
//       });
//     }

//     const staff = await Staff.findById(staffId);

//     if (!staff) {
//       return res.status(404).json({
//         message: "Staff not found",
//       });
//     }

//     staff.isActive = isActive;

//     await staff.save();

//     res.status(200).json({
//       message: `Staff account ${
//         isActive ? "activated" : "deactivated"
//       } successfully`,
//       data: {
//         id: staff._id,
//         firstName: staff.firstName,
//         lastName: staff.lastName,
//         email: staff.email,
//         role: staff.role,
//         department: staff.department,
//         isActive: staff.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Update staff status error:", error);

//     res.status(500).json({
//       message: "Failed to update staff status",
//       error: error.message,
//     });
//   }
// };

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select("-password");

    res.status(200).json({
      message: "Staff retrieved successfully",
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);

    res.status(500).json({
      message: "Failed to retrieve staff",
      error: error.message,
    });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId).select("-password");

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.status(200).json({
      message: "Staff retrieved successfully",
      data: staff,
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);

    res.status(500).json({
      message: "Failed to retrieve staff",
      error: error.message,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { firstName, lastName, phone, department } = req.body;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    // Nobody can edit their own staff record through this route
    if (staff._id.toString() === req.staff._id.toString()) {
      return res.status(400).json({
        message: "You cannot update your own staff account",
      });
    }

    // The super admin cannot be edited by an ordinary admin
    if (
      staff.role === "super_admin" &&
      req.staff.role !== "super_admin"
    ) {
      return res.status(403).json({
        message: "Only the super admin can update the super admin account",
      });
    }

    // An ordinary admin cannot edit another admin
    if (
      staff.role === "admin" &&
      req.staff.role !== "super_admin"
    ) {
      return res.status(403).json({
        message: "Only the super admin can update an admin",
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

    res.status(200).json({
      message: "Staff updated successfully",
      data: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);

    res.status(500).json({
      message: "Failed to update staff",
      error: error.message,
    });
  }
};
//
// exports.updateStaff = async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { firstName, lastName, phone, department } = req.body;

//     const staff = await Staff.findById(staffId);

//     if (!staff) {
//       return res.status(404).json({
//         message: "Staff not found",
//       });
//     }

//     if (firstName !== undefined) {
//       staff.firstName = firstName;
//     }

//     if (lastName !== undefined) {
//       staff.lastName = lastName;
//     }

//     if (phone !== undefined) {
//       staff.phone = phone;
//     }

//     if (department !== undefined) {
//       staff.department = department;
//     }

//     await staff.save();

//     res.status(200).json({
//       message: "Staff updated successfully",
//       data: {
//         id: staff._id,
//         firstName: staff.firstName,
//         lastName: staff.lastName,
//         email: staff.email,
//         phone: staff.phone,
//         role: staff.role,
//         department: staff.department,
//         isActive: staff.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Update staff error:", error);

//     res.status(500).json({
//       message: "Failed to update staff",
//       error: error.message,
//     });
//   }
// };

//update staff role
exports.updateStaffRole = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { role } = req.body;

    if (!["staff", "admin"].includes(role)) {
      return res.status(400).json({
        message: "role must be staff or admin",
      });
    }

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    // Nobody can change their own role
    if (staff._id.toString() === req.staff._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    // Only the super admin can create or remove admins
    if (role === "admin" && req.staff.role !== "super_admin") {
      return res.status(403).json({
        message: "Only the super admin can assign the admin role",
      });
    }

    // Only the super admin can demote an admin
    if (staff.role === "admin" && req.staff.role !== "super_admin") {
      return res.status(403).json({
        message: "Only the super admin can change an admin's role",
      });
    }

    // Nobody can change the super admin's role
    if (staff.role === "super_admin") {
      return res.status(403).json({
        message: "The super admin role cannot be changed",
      });
    }

    staff.role = role;

    await staff.save();

    res.status(200).json({
      message: "Staff role updated successfully",
      data: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    console.error("Update staff role error:", error);

    res.status(500).json({
      message: "Failed to update staff role",
      error: error.message,
    });
  }
};

// exports.updateStaffRole = async (req, res) => {
//   try {
//     const { staffId } = req.params;
//     const { role } = req.body;

//     if (!["staff", "admin"].includes(role)) {
//       return res.status(400).json({
//         message: "role must be staff or admin",
//       });
//     }

//     const staff = await Staff.findById(staffId);

//     if (!staff) {
//       return res.status(404).json({
//         message: "Staff not found",
//       });
//     }

//     // Prevent an admin from changing their own role
//     if (staff._id.toString() === req.staff._id.toString()) {
//       return res.status(400).json({
//         message: "You cannot change your own role",
//       });
//     }

//     staff.role = role;

//     await staff.save();

//     res.status(200).json({
//       message: "Staff role updated successfully",
//       data: {
//         id: staff._id,
//         firstName: staff.firstName,
//         lastName: staff.lastName,
//         email: staff.email,
//         role: staff.role,
//         department: staff.department,
//         isActive: staff.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Update staff role error:", error);

//     res.status(500).json({
//       message: "Failed to update staff role",
//       error: error.message,
//     });
//   }
// };

exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    // Nobody can delete their own account
    if (staff._id.toString() === req.staff._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    // The super admin cannot be deleted
    if (staff.role === "super_admin") {
      return res.status(403).json({
        message: "The super admin cannot be deleted",
      });
    }

    // An ordinary admin cannot delete another admin
    if (
      staff.role === "admin" &&
      req.staff.role !== "super_admin"
    ) {
      return res.status(403).json({
        message: "Only the super admin can delete an admin",
      });
    }

    await Staff.findByIdAndDelete(staffId);

    res.status(200).json({
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);

    res.status(500).json({
      message: "Failed to delete staff",
      error: error.message,
    });
  }
};


// //before delete staff
// exports.deleteStaff = async (req, res) => {
//   try {
//     const { staffId } = req.params;

//     const staff = await Staff.findById(staffId);

//     if (!staff) {
//       return res.status(404).json({
//         message: "Staff not found",
//       });
//     }

//     // Prevent an admin from deleting their own account
//     if (staff._id.toString() === req.staff._id.toString()) {
//       return res.status(400).json({
//         message: "You cannot delete your own account",
//       });
//     }

//     await Staff.findByIdAndDelete(staffId);

//     res.status(200).json({
//       message: "Staff deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete staff error:", error);

//     res.status(500).json({
//       message: "Failed to delete staff",
//       error: error.message,
//     });
//   }
// };

exports.createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      department,
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
          "firstName, lastName, email, phone and password are required",
      });
    }

    const existingStaff = await Staff.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingStaff) {
      return res.status(400).json({
        message: "Staff with this email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Staff.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      department: department || "management",
      isActive: true,
    });

    res.status(201).json({
      message: "Admin created successfully",
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    res.status(500).json({
      message: "Failed to create admin",
      error: error.message,
    });
  }
};