// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const dotenv = require("dotenv");

// const Staff = require("../Models/Staff");

// dotenv.config();

// const createSuperAdmin = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("MongoDB connected");

//     const existingSuperAdmin = await Staff.findOne({
//       role: "super_admin",
//     });

//     if (existingSuperAdmin) {
//       console.log("A super admin already exists.");
//       process.exit(0);
//     }

//     const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

//     const superAdmin = await Staff.create({
//       firstName: "System",
//       lastName: "Owner",
//       email: process.env.SUPER_ADMIN_EMAIL,
//       phone: process.env.SUPER_ADMIN_PHONE,
//       password: hashedPassword,
//       role: "super_admin",
//       department: "management",
//       isActive: true,
//     });

//     console.log("Super admin created successfully.");
//     console.log("Super admin ID:", superAdmin._id);
//     console.log("Email:", superAdmin.email);

//     process.exit(0);
//   } catch (error) {
//     console.error("Failed to create super admin:", error);
//     process.exit(1);
//   }
// };

// createSuperAdmin();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const Staff = require("../Models/Staff");

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingSuperAdmin = await Staff.findOne({
      role: "super_admin",
    });

    if (existingSuperAdmin) {
      console.log("A super admin already exists.");
      process.exit(0);
    }

    if (
      !process.env.SUPER_ADMIN_EMAIL ||
      !process.env.SUPER_ADMIN_PASSWORD ||
      !process.env.SUPER_ADMIN_PHONE
    ) {
      console.error(
        "SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD and SUPER_ADMIN_PHONE are required in .env"
      );
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      10
    );

    const superAdmin = await Staff.create({
      firstName: "System",
      lastName: "Owner",
      email: process.env.SUPER_ADMIN_EMAIL,
      phone: process.env.SUPER_ADMIN_PHONE,
      password: hashedPassword,
      role: "super_admin",
      department: "management",
      isActive: true,
    });

    console.log("Super admin created successfully.");
    console.log("Super admin ID:", superAdmin._id);
    console.log("Super admin email:", superAdmin.email);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create super admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();