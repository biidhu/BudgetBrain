# BudgetBrain
For smart finance management

## Architecture Overview
- **Frontend**: React web UI with login, dashboard, transaction list, budget tracker
- **Backend**: Node.js/Express API server with authentication, transaction CRUD, budget management
- **Database**: SQLite (users, transactions, budgets, categories)

## Quick Start
1. Install backend dependencies: `cd backend && npm install`
2. Install frontend dependencies: `cd frontend && npm install`
3. Run the backend: `cd backend && npm start` (runs on http://localhost:5000)
4. Run the frontend: `cd frontend && npm start` (runs on http://localhost:3000)

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Features
- Login page with email/password authentication
- Dashboard with financial summary (balance, income, expenses)
- Transaction list with ability to add new transactions
- Budget tracker to set and manage category budgets
- Real-time data syncing between frontend and backend

## API Endpoints
- `POST /login` - User authentication
- `GET /transactions` - Retrieve all transactions
- `POST /transactions` - Create new transaction
- `GET /budgets` - Retrieve all budgets
- `POST /budgets` - Create new budget


