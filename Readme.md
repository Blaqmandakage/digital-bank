Digital Bank Backend

Node.js/Express digital banking backend with customer authentication, banking operations, NIBSS integration, and role-based staff administration.

Live API

https://digital-bank-kvhc.onrender.com

Role Hierarchy

SUPER ADMIN
     ↓
   ADMIN
     ↓
   STAFF

Super Admin

There is no public super-admin registration endpoint.

The first super admin is created once during secure setup:

node Scripts/createSuperAdmin.js

The script reads these values from .env:

SUPER_ADMIN_EMAIL=your_super_admin_email
SUPER_ADMIN_PASSWORD=your_super_admin_password
SUPER_ADMIN_PHONE=your_super_admin_phone

It hashes the password with bcrypt and creates a Staff record with:

role: super_admin
department: management
isActive: true

Staff Login

All three staff roles use the same endpoint:

POST /staff/login

Request:

{
  "email": "staff@example.com",
  "password": "your-password"
}

The response contains a JWT and the staff role.

How the Frontend Shows Different Dashboards

A separate login endpoint is not necessary.

The frontend logs in through /staff/login, then reads:

data.staff.role

Routing:

staff
  ↓
Staff Dashboard

admin
  ↓
Admin Dashboard

super_admin
  ↓
Super Admin Dashboard

So the same login page/portal can serve all three roles while displaying a completely different dashboard after authentication.

The frontend controls navigation. The backend remains the real security boundary and rejects unauthorized requests.

Staff Registration

POST /staff/register

Protected. Admin or super_admin can create normal staff.

This endpoint always creates:

role: staff

It cannot be used to create an admin or super_admin.

Create Admin

POST /staff/admins

Super-admin only.

The controller always creates:

role: admin

The client cannot request super_admin through this endpoint.

Role Management

PATCH /staff/:staffId/role

Only the super admin can actually promote staff to admin or demote admin to staff.

Allowed:

staff → admin
admin → staff

Blocked:

staff → super_admin
admin → super_admin
super_admin → anything

Staff Status

PATCH /staff/:staffId/status

Admins can manage ordinary staff.

The super admin can manage staff and admins.

The super admin cannot be deactivated.

A user cannot change their own account status.

Staff Update

PATCH /staff/:staffId

Admins can update ordinary staff.

The super admin can update staff and admins.

The super admin is protected from ordinary-admin modification.

Delete Staff

DELETE /staff/:staffId

Admins can delete ordinary staff.

The super admin can delete ordinary staff and admins.

The super admin cannot be deleted.

A user cannot delete their own account.

Staff Operational Endpoints

GET /staff/customers
GET /staff/customers/:customerId/accounts
GET /staff/customers/:customerId/transactions
POST /staff/customers/:customerId/accounts/:accountNumber/balance
GET /staff/transactions/:transactionId

Available to staff, admin, and super_admin.

GET /staff/
GET /staff/:staffId

Available to admin and super_admin.

Customer API

POST /customers/register
POST /customers/login
GET /customers/profile
GET /customers/transactions

Protected customer endpoints require the customer JWT.

Bank API

GET /bank/my-accounts
POST /bank/account
POST /bank/name-enquiry
POST /bank/validate-bvn
POST /bank/validate-nin
POST /bank/transfer
POST /bank/transfer-status
POST /bank/account-balance

Customer-protected routes require the customer JWT.

Typical Customer Flow

Register
   ↓
Login
   ↓
Customer JWT
   ↓
Validate BVN/NIN
   ↓
Create Account
   ↓
My Accounts
   ↓
Name Enquiry
   ↓
Transfer
   ↓
Transaction Status
   ↓
Balance
   ↓
Transaction History

Typical Staff Flow

Staff Login
   ↓
role = staff
   ↓
Staff Dashboard
   ↓
Customers / Accounts / Transactions / Balances

Typical Admin Flow

Staff Login
   ↓
role = admin
   ↓
Admin Dashboard
   ↓
Staff Management

Typical Super Admin Flow

Staff Login
   ↓
role = super_admin
   ↓
Super Admin Dashboard
   ↓
Manage Staff
   ↓
Create Admin
   ↓
Promote / Demote Admins
   ↓
Activate / Deactivate Admins
   ↓
Delete Admins

NIBSS Integration

The backend communicates with the NIBSS by Phoenix simulated API through the service layer.

Operations include fintech onboarding, NIBSS authentication, account creation, name enquiry, BVN validation, NIN validation, transfers, transaction status, account balance, and BVN/NIN identity test-data insertion.

BVN/NIN insertion is identity-store/test-data setup. Customer verification validates existing records.

Security

Passwords are hashed before storage.

Customer and staff authentication use JWTs.

Staff roles are enforced by backend middleware/controllers.

Super-admin credentials are supplied through environment variables during setup.

.env must never be committed to GitHub.

Never expose passwords, JWT secrets, database credentials, NIBSS credentials, or access tokens.

Frontend dashboard routing is not a security control; backend authorization is authoritative.

Project Structure

digital-bank/
├── Config/
├── Controllers/
├── Middleware/
├── Models/
├── Routes/
├── Services/
├── Scripts/
│   └── createSuperAdmin.js
├── .gitignore
├── .env
├── app.js
├── package.json
└── package-lock.json

Status Codes

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

Deployment

Production URL:

https://digital-bank-kvhc.onrender.com

Configure environment variables on Render instead of committing .env.

Author

Blaqmandakage