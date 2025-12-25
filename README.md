# Expense Tracker Application

A full-stack expense tracking application with categorization, filtering, and dashboard analytics.

## Tech Stack
- **Frontend**: Vue.js 3 + Tailwind CSS
- **Backend**: Express.js
- **Database**: MySQL

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

### Database Setup

1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create database and user:
```sql
CREATE DATABASE expense_tracker;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run init-db
npm run dev
```

Backend will run on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## API Endpoints

- `GET /api/expenses` - Get all expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/categories` - Get all categories
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/category-breakdown` - Get category breakdown
- `GET /api/dashboard/monthly-trend` - Get monthly trend

## Features

- ✅ Add, edit, delete expenses
- ✅ Categorize expenses
- ✅ Filter by date range
- ✅ Sort by date, amount, category
- ✅ Dashboard with analytics
- ✅ Category breakdown chart
- ✅ Monthly spending trends
- ✅ Responsive design

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── views/
    │   ├── services/
    │   └── App.vue
    └── index.html
```
