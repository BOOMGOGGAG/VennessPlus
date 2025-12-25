# QUICK REFERENCE - Installation Commands

## 🚀 Complete Setup (Copy and Paste)

### 1. MySQL Database Setup
```sql
-- Login to MySQL
mysql -u root -p

-- Execute these commands
CREATE DATABASE expense_tracker;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev
```

### 3. Frontend Setup (Open New Terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📦 Individual Package Installation

### Backend Dependencies:
```bash
cd backend
npm install express mysql2 dotenv cors body-parser
npm install --save-dev nodemon
```

### Frontend Dependencies:
```bash
cd frontend
npm install vue vue-router axios chart.js vue-chartjs
npm install --save-dev @vitejs/plugin-vue vite tailwindcss postcss autoprefixer
```

---

## 🔄 Restart Commands

### Restart Backend:
```bash
cd backend
npm run dev
```

### Restart Frontend:
```bash
cd frontend
npm run dev
```

---

## 🧹 Clean Install

If you encounter issues, do a clean install:

### Backend:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run init-db
```

### Frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Health Check:** http://localhost:3000/api/health
- **API Documentation:** http://localhost:3000

---

## 📊 Database Reset

To reset the database with fresh sample data:

```bash
cd backend
npm run init-db
```

This will:
- Create tables if they don't exist
- Insert default categories
- Add sample expense records

---

## 🛠️ Common Commands

### Check if servers are running:
```bash
# Check backend (port 3000)
curl http://localhost:3000/api/health

# Check frontend (port 5173)
# Open browser: http://localhost:5173
```

### View logs:
```bash
# Backend logs are shown in the terminal where you ran npm run dev
# Frontend logs are shown in browser console (F12)
```

### Stop servers:
```bash
# Press Ctrl+C in the terminal where the server is running
```

---

## 🐛 Quick Troubleshooting

### Backend won't start:
```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Frontend won't start:
```bash
cd frontend
npm install
npm run dev
```

### Database connection error:
1. Check if MySQL is running
2. Verify credentials in `backend/.env`
3. Run `npm run init-db` again

### Port already in use:
```bash
# Linux/Mac - Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 💡 Pro Tips

1. **Always run backend before frontend**
2. **Keep both terminals open** to see logs
3. **Use nodemon** for auto-restart (already configured)
4. **Check browser console** for frontend errors (F12)
5. **Check terminal** for backend errors

---

## ✅ Verification

Run these to verify everything is working:

```bash
# Test backend health
curl http://localhost:3000/api/health

# Test categories endpoint
curl http://localhost:3000/api/categories

# Test expenses endpoint
curl http://localhost:3000/api/expenses

# Test dashboard
curl http://localhost:3000/api/dashboard/summary
```

Expected: JSON responses with data

---

**Ready to go! 🎉**
Open http://localhost:5173 in your browser to start using the Expense Tracker!
