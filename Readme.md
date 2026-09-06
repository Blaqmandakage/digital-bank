Digital Bank Backend

A Node.js/Express backend for a digital banking application. The project provides customer authentication, bank-account creation, BVN/NIN validation, account name enquiry, fund transfers, balances, transaction history, and staff/admin operations.

Live API

Production Base URL

https://digital-bank-kvhc.onrender.com

The API is deployed on Render.

Tech Stack

Node.js

Express.js

MongoDB

Mongoose

JWT authentication

bcrypt / bcryptjs for password hashing

Axios for external API communication

CORS

NIBSS by Phoenix simulated banking API

Render for deployment

Project Structure

digital-bank/
│
├── Config/
│   └── databaseConfig.js
│
├── Controllers/
│   ├── customerController.js
│   ├── NibssController.js
│   └── staffController.js
│
├── Middleware/
│   ├── customerAuth.js
│   └── staffAuth.js
│
├── Models/
│   ├── Account.js
│   ├── Customer.js
│   ├── Staff.js
│   └── Transactions.js
│
├── Routes/
│   ├── customerRoute.js
│   ├── nibssRoute.js
│   └── staffRoute.js
│
├── Services/
│   └── nibssService.js
│
├── .gitignore
├── app.js
├── package.json
└── package-lock.json

Installation

Clone the repository:

git clone https://github.com/Blaqmandakage/digital-bank.git

Move into the project:

cd digital-bank

Install dependencies:

npm install

Environment Variables

Create a .env file in the project root.

Example:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Never commit .env to GitHub.

The .gitignore file should contain:

.env
node_modules

Running Locally

Start the server:

node app.js

For development with nodemon:

npx nodemon app.js

The API will run on the configured port.

Example:

Server is running on port 5000
MongoDB connected

Authentication

Customer authentication uses JWT.

A customer first registers:

POST /customers/register

Then logs in:

POST /customers/login

A successful login returns a JWT.

Protected customer endpoints require:

Authorization: Bearer YOUR_JWT_TOKEN

The frontend should store the customer's JWT and automatically attach it to protected requests.

Authentication Flow

Register
   ↓
Login
   ↓
Receive JWT
   ↓
Store JWT
   ↓
Send JWT with protected requests
   ↓
Backend verifies JWT
   ↓
Request is allowed or rejected

Customer API

Register

POST /customers/register

Request body:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "09012345678",
  "password": "your-password",
  "dob": "1995-05-20"
}

Login

POST /customers/login

Request body:

{
  "email": "john@example.com",
  "password": "your-password"
}

Profile

GET /customers/profile

Authentication required.

Transactions

GET /customers/transactions

Authentication required.

Returns transactions where the customer's accounts are either the sender or receiver.

Bank API

Create Account

POST /bank/account

Authentication required.

Get My Accounts

GET /bank/my-accounts

Authentication required.

Name Enquiry

POST /bank/name-enquiry

Checks the account name associated with an account number.

Validate BVN

POST /bank/validate-bvn

Authentication required.

Validate NIN

POST /bank/validate-nin

Authentication required.

Transfer Funds

POST /bank/transfer

Authentication required.

The backend verifies that the sender account belongs to the authenticated customer before performing the transfer.

Transfer Status

POST /bank/transfer-status

Retrieves the status of a NIBSS transaction.

Account Balance

POST /bank/account-balance

Authentication required.

The backend verifies that the account belongs to the authenticated customer before retrieving its balance.

Staff API

Staff authentication is separate from customer authentication.

Staff Registration

POST /staff/register

New staff accounts receive the staff role by default.

Staff Login

POST /staff/login

Get Customers

GET /staff/customers

Staff/Admin authentication required.

Get Customer Accounts

GET /staff/customers/:customerId/accounts

Staff/Admin authentication required.

Get Customer Transactions

GET /staff/customers/:customerId/transactions

Staff/Admin authentication required.

Get Customer Account Balance

POST /staff/customers/:customerId/accounts/:accountNumber/balance

Staff/Admin authentication required.

Get Transaction

GET /staff/transactions/:transactionId

Staff/Admin authentication required.

Get All Staff

GET /staff/

Staff/Admin authentication required.

Get Staff By ID

GET /staff/:staffId

Staff/Admin authentication required.

Admin-Only Operations

The following operations require the admin role:

PATCH /staff/:staffId

PATCH /staff/:staffId/status

PATCH /staff/:staffId/role

DELETE /staff/:staffId

An administrator cannot deactivate, change the role of, or delete their own account.

NIBSS Integration

The backend integrates with the NIBSS by Phoenix simulated API.

The NIBSS service is responsible for communication with the external banking API.

The main integration operations include:

Fintech onboarding

NIBSS authentication/token generation

Bank account creation

Account name enquiry

BVN validation

NIN validation

Fund transfer

Transaction status enquiry

Account balance enquiry

BVN/NIN test-data insertion

The NIBSS integration is handled by the backend service layer.

Typical Customer Flow

Customer Registration
        ↓
Customer Login
        ↓
Customer JWT
        ↓
BVN/NIN Validation
        ↓
Bank Account Creation
        ↓
My Accounts
        ↓
Name Enquiry
        ↓
Fund Transfer
        ↓
Transaction Status
        ↓
Account Balance
        ↓
Transaction History

Error Handling

The API uses standard HTTP status codes:

Status

Meaning

200

Request successful

201

Resource created

400

Bad request

401

Authentication missing or invalid

403

Authenticated but not authorized

404

Resource not found

409

Resource conflict

500

Internal server error

Security Notes

Passwords are hashed before being stored.

JWT authentication protects customer and staff routes.

Staff roles control admin-only operations.

Customers can only access their own accounts and account balances.

Customers can only initiate transfers from their own accounts.

.env must not be committed to GitHub.

Database credentials, JWT secrets, NIBSS credentials, and tokens should never be exposed publicly.

Frontend Integration

The frontend communicates with the backend using the production base URL:

https://digital-bank-kvhc.onrender.com

For customer-protected endpoints, the frontend sends:

Authorization: Bearer CUSTOMER_JWT

The frontend should not manually copy and paste JWT tokens for every request. After login, the frontend can store the returned JWT and automatically attach it to protected API requests.

API Documentation

For the complete frontend-facing endpoint documentation, refer to the project's Digital Bank API Documentation.

Deployment

The backend is deployed on Render.

Production URL:

https://digital-bank-kvhc.onrender.com

When deploying, configure the required environment variables in the hosting platform rather than committing .env to the repository.

Project Status

The backend currently includes:

Customer registration and login

JWT authentication

Customer profiles

Customer transaction history

Bank account creation

Customer account retrieval

Account name enquiry

BVN validation

NIN validation

Fund transfers

Transaction status checking

Account balance checking

Staff authentication

Staff/customer management

Admin role management

NIBSS API integration

MongoDB persistence

Production deployment

Author

Blaqmandakage

Backend development project focused on learning and implementing real-world API integration, authentication, authorization, database operations, and banking workflows.