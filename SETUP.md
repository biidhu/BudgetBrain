# BudgetBrain - Setup Instructions

## Project Structure
- **Frontend**: React web application
- **Backend**: Node.js Express API server
- **Database**: SQLite

## Frontend Features
1. **Login Page** - User authentication
2. **Dashboard** - Financial summary with balance, income, expenses
3. **Transaction List** - Add and view transactions
4. **Budget Tracker** - Set and manage budgets by category

## Backend API Endpoints

### Authentication
- `POST /login` - User login (email, password)

### Transactions
- `GET /transactions` - Retrieve all transactions
- `POST /transactions` - Create new transaction

### Budgets
- `GET /budgets` - Retrieve all budgets
- `POST /budgets` - Create new budget

## Getting Started

### Prerequisites
- Node.js v14+ 
- npm

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

####Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## API Architecture

```
┌────────────────────────────┐
│   Frontend Web UI (React)   │
│  - Login page              │
│  - Dashboard               │
│  - Transaction list        │
│  - Budget tracker          │
└────────────┬───────────────┘
             │
             │ HTTP requests (axios)
             │ (login, transactions, budget)
             │
┌────────────▼───────────────────────────────────┐
│     Backend API Server (Node.js/Express)       │
│  - Authentication routes                       │
│  - Transaction CRUD endpoints                  │
│  - Budget management logic                     │
│  - Validation & business rules                 │
└────────────┬────────────────────┬──────────────┘
             │                    │
        validates user      reads/writes data
             │                    │
      ┌──────▼────┐       ┌──────▼──────────┐
      │   Auth     │       │    SQLite       │
      │  Service   │       │    Database     │
      │ (External) │       │                 │
      └────────────┘       │  - Users        │
                           │  - Transactions │
                           │  - Budgets      │
                           │  - Categories   │
                           └─────────────────┘
```

## Database Schema

The SQLite database (budgetbrain.db) contains:

- **users** - User authentication
- **transactions** - Financial transactions
- **budgets** - Budget limits by category
- **categories** - Transaction categories

## Testing

### Test Credentials
- Email: test@test.com
- Password: 1234

### Create Test Data

You can use tools like Postman or curl to test the API:

```bash
# Login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"1234"}'

# Add transaction
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"amount":100,"description":"Groceries","category":"Food","date":"2026-04-03"}'

# Get transactions
curl http://localhost:5000/transactions
```

## Development

### Frontend Technologies
- React 18
- React Router for navigation
- Axios for API calls

### Backend Technologies
- Express.js
- SQLite3
- CORS enabled for frontend communication

## Notes

- The backend creates the SQLite database automatically on startup
- Test user credentials are hardcoded for demo purposes
- Use bcryptjs and JWT in production for secure authentication
- Environment variables can be configured in `.env` file
