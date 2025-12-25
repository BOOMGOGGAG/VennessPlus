# 🚀 QUICK START GUIDE - Expense Tracker

## ⚡ Installation in 3 Steps

### Step 1️⃣: Setup MySQL Database
```sql
mysql -u root -p

CREATE DATABASE expense_tracker;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2️⃣: Setup Backend
```bash
cd backend
npm install
npm run init-db
npm run dev
```
✅ Backend running on http://localhost:3000

### Step 3️⃣: Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running on http://localhost:5173

---

## 📦 What You Got

### ✨ Features
- ✅ Add, edit, delete expenses
- ✅ 8 pre-configured categories with icons
- ✅ Dashboard with analytics & charts
- ✅ Filter by date range and category
- ✅ Sort by date, amount, or category
- ✅ Monthly spending trends
- ✅ Category breakdown with percentages
- ✅ Responsive design (mobile-friendly)

### 🛠️ Tech Stack
- **Backend:** Express.js + MySQL
- **Frontend:** Vue.js 3 + Tailwind CSS
- **Charts:** Chart.js
- **HTTP Client:** Axios

---

## 📂 Project Files (31 files created)

```
expense-tracker/
├── 📄 Documentation
│   ├── README.md              # Main documentation
│   ├── INSTALLATION.md        # Detailed setup guide
│   ├── COMMANDS.md            # Quick reference
│   └── PROJECT_STRUCTURE.md  # Complete file overview
│
├── 🔧 Setup Scripts
│   ├── setup.sh               # Linux/Mac automated setup
│   └── setup.bat              # Windows automated setup
│
├── 📂 backend/                # Express.js Backend (16 files)
│   ├── server.js              # Main server
│   ├── config/                # Database config
│   ├── models/                # Data models
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   └── scripts/               # Database init
│
└── 📂 frontend/               # Vue.js Frontend (11 files)
    ├── src/
    │   ├── App.vue            # Root component
    │   ├── views/             # Page components
    │   ├── services/          # API service
    │   └── router/            # Navigation
    └── config files           # Vite, Tailwind, etc.
```

---

## 🎯 Default Data Included

### Categories (8)
1. 🍔 Food & Dining
2. 🚗 Transportation
3. 🛍️ Shopping
4. 🎬 Entertainment
5. 💡 Bills & Utilities
6. ⚕️ Healthcare
7. 📚 Education
8. 📌 Other

### Sample Expenses
- 8 example transactions
- Various amounts and dates
- Different categories

---

## 🌐 API Endpoints

### Expenses
- `GET /api/expenses` - Get all (with filters)
- `POST /api/expenses` - Create new
- `PUT /api/expenses/:id` - Update
- `DELETE /api/expenses/:id` - Delete

### Categories
- `GET /api/categories` - Get all
- `POST /api/categories` - Create new
- `PUT /api/categories/:id` - Update
- `DELETE /api/categories/:id` - Delete

### Dashboard
- `GET /api/dashboard/summary` - Statistics
- `GET /api/dashboard/category-breakdown` - By category
- `GET /api/dashboard/monthly-trend` - Monthly data

---

## 🎨 Frontend Pages

### 1. Dashboard (/)
- Total expenses summary
- Transaction count
- Average expense
- Highest expense
- Category breakdown chart
- Monthly trend line chart
- Date range filters

### 2. Expenses (/expenses)
- Full expense list table
- Add new expense
- Edit existing expense
- Delete expense
- Filter by date range
- Filter by category
- Sort by date/amount/category
- Ascending/Descending order

---

## ⚙️ Configuration

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=expense_user
DB_PASSWORD=expense_password
DB_NAME=expense_tracker
DB_PORT=3306
```

### Frontend
Proxied through Vite to backend
No additional config needed

---

## 🧪 Test Your Installation

```bash
# Test backend
curl http://localhost:3000/api/health

# Test categories
curl http://localhost:3000/api/categories

# Test expenses
curl http://localhost:3000/api/expenses

# Open frontend
# http://localhost:5173
```

---

## 🐛 Troubleshooting

### MySQL Connection Failed?
1. Check MySQL is running
2. Verify credentials in `.env`
3. Run `npm run init-db` again

### Port Already in Use?
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Module Not Found?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Files

1. **README.md** - Project overview & features
2. **INSTALLATION.md** - Step-by-step setup (detailed)
3. **COMMANDS.md** - All commands reference
4. **PROJECT_STRUCTURE.md** - Complete file structure & API docs

---

## 🎓 What You Can Learn

This project demonstrates:
- RESTful API design
- MVC architecture
- MySQL database design
- Vue.js 3 Composition API
- Component-based architecture
- State management
- Axios HTTP requests
- Chart.js integration
- Tailwind CSS styling
- Responsive design
- Form validation
- CRUD operations
- Date filtering
- Sorting algorithms
- Data aggregation

---

## 🚀 Next Steps

1. **Customize Categories** - Add your own expense categories
2. **Add Expenses** - Start tracking your spending
3. **Analyze Data** - Use dashboard to see spending patterns
4. **Extend Features** - Add budgets, recurring expenses, etc.
5. **Deploy** - Host on a server for remote access

---

## 📊 Database Schema

### Categories Table
```sql
id, name, color, icon, created_at
```

### Expenses Table
```sql
id, amount, category_id, description, expense_date, 
created_at, updated_at
```

---

## ✅ Quick Checklist

Before running:
- [ ] Node.js installed (v14+)
- [ ] MySQL installed (v8.0+)
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database initialized
- [ ] Both servers running

---

## 💡 Pro Tips

1. **Run backend first** - Frontend needs API
2. **Keep terminals open** - See logs in real-time
3. **Check browser console** - For frontend errors (F12)
4. **Use nodemon** - Auto-restart enabled
5. **Sample data included** - Start exploring immediately

---

## 🎉 You're Ready!

Open your browser to:
👉 **http://localhost:5173**

Start tracking your expenses!

---

**Need Help?**
Check these files:
- INSTALLATION.md - Detailed setup
- COMMANDS.md - Command reference
- PROJECT_STRUCTURE.md - Architecture details

**Happy Expense Tracking! 💰📊**
