const express = require("express");
const connectDB = require("./Config/databaseConfig");
const dotenv = require("dotenv");
const customerRoutes = require("./Routes/customerRoute");
const nibssRoutes = require("./Routes/nibssRoute");
const staffRoutes = require("./Routes/staffRoute");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/customers", customerRoutes);
app.use("/bank", nibssRoutes);
app.use("/staff", staffRoutes);



connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
