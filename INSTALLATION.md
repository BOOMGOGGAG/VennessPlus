# INSTALLATION GUIDE - Expense Tracker

This guide provides step-by-step instructions to set up and run the Expense Tracker application.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MySQL** (v8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

---

## 🚀 Quick Start (Automated Setup)

### For Linux/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

### For Windows:
```bash
setup.bat
```

The automated script will:
- Install all dependencies
- Guide you through MySQL setup
- Initialize the database
- Prepare both backend and frontend

---

## 📝 Manual Installation (Step by Step)

### Step 1: MySQL Database Setup

1. Open MySQL command line:
```bash
mysql -u root -p
```

2. Create the database and user:
```sql
CREATE DATABASE expense_tracker;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. (Optional) If you want to use different credentials, update `backend/.env` file accordingly.

---

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Verify `.env` file exists (it should be created from `.env.example`):
```bash
cat .env
```

4. Initialize the database with tables and sample data:
```bash
npm run init-db
```

Expected output:
```
Connected to MySQL server
Database 'expense_tracker' created or already exists
Categories table created
Expenses table created
Default categories inserted
Sample expenses inserted
✅ Database initialization completed successfully!
```

5. Start the backend server:
```bash
npm run dev
```

The backend server will start on **http://localhost:3000**

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔧 Configuration

### Backend Configuration (backend/.env)

```env
PORT=3000
DB_HOST=localhost
DB_USER=expense_user
DB_PASSWORD=expense_password
DB_NAME=expense_tracker
DB_PORT=3306
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend through Vite (see `frontend/vite.config.js`).

---

## 📦 NPM Commands Reference

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm run init-db` | Initialize database with tables and sample data |

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🧪 Testing the Installation

1. **Backend Health Check:**
   - Open browser: http://localhost:3000/api/health
   - Expected response: `{"success":true,"message":"Server is running"}`

2. **Frontend:**
   - Open browser: http://localhost:5173
   - You should see the Expense Tracker dashboard

3. **Test API Endpoints:**
   ```bash
   # Get all categories
   curl http://localhost:3000/api/categories
   
   # Get all expenses
   curl http://localhost:3000/api/expenses
   
   # Get dashboard summary
   curl http://localhost:3000/api/dashboard/summary
   ```

---

## 🗂️ Project Structure

```
expense-tracker/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── expenseController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── Category.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── categories.js
│   │   ├── expenses.js
│   │   └── dashboard.js
│   ├── scripts/
│   │   └── initDatabase.js      # Database initialization
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── views/
    │   │   ├── Dashboard.vue
    │   │   └── Expenses.vue
    │   ├── services/
    │   │   └── api.js           # API service
    │   ├── router/
    │   │   └── index.js         # Vue Router
    │   ├── App.vue
    │   ├── main.js
    │   └── style.css            # Tailwind CSS
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🐛 Troubleshooting

### MySQL Connection Error

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solution:**
1. Verify MySQL is running: `sudo service mysql status` (Linux) or check Services (Windows)
2. Check credentials in `backend/.env`
3. Ensure user has proper permissions

### Port Already in Use

**Error:** `EADDRINUSE`

**Solution:**
1. Backend (port 3000):
   ```bash
   # Linux/Mac
   lsof -i :3000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Frontend (port 5173): Change port in `frontend/vite.config.js`

### Database Not Initialized

**Error:** Tables don't exist

**Solution:**
```bash
cd backend
npm run init-db
```

### Module Not Found

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Next Steps

After successful installation:

1. **Explore the Dashboard** - View expense summaries and charts
2. **Add Expenses** - Click "Add Expense" to record transactions
3. **Filter Data** - Use date ranges and category filters
4. **Sort Expenses** - Sort by date, amount, or category
5. **Customize Categories** - Add your own expense categories

---

## 📚 Additional Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## 🆘 Support

If you encounter any issues not covered in this guide:

1. Check the console logs for both backend and frontend
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Review the error messages carefully

---

## ✅ Verification Checklist

Before running the application, ensure:

- [ ] Node.js is installed (v14+)
- [ ] MySQL is installed and running (v8.0+)
- [ ] Database `expense_tracker` is created
- [ ] Database user has proper permissions
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Database tables initialized (run `npm run init-db`)
- [ ] Backend server is running (port 3000)
- [ ] Frontend server is running (port 5173)

**Happy Expense Tracking! 💰📊**
