# PROJECT STRUCTURE - Expense Tracker

## 📁 Complete File Structure

```
expense-tracker/
├── 📄 README.md                          # Main project documentation
├── 📄 INSTALLATION.md                    # Detailed installation guide
├── 📄 COMMANDS.md                        # Quick reference commands
├── 📄 .gitignore                        # Git ignore rules
├── 🔧 setup.sh                          # Linux/Mac setup script
├── 🔧 setup.bat                         # Windows setup script
│
├── 📂 backend/                          # Express.js Backend
│   ├── 📄 package.json                  # Backend dependencies
│   ├── 📄 .env                          # Environment variables
│   ├── 📄 .env.example                  # Environment template
│   ├── 📄 server.js                     # Main server file
│   │
│   ├── 📂 config/
│   │   └── 📄 database.js               # MySQL connection pool
│   │
│   ├── 📂 models/
│   │   ├── 📄 Category.js               # Category model (CRUD operations)
│   │   └── 📄 Expense.js                # Expense model (CRUD + analytics)
│   │
│   ├── 📂 controllers/
│   │   ├── 📄 categoryController.js     # Category endpoints logic
│   │   ├── 📄 expenseController.js      # Expense endpoints logic
│   │   └── 📄 dashboardController.js    # Dashboard analytics logic
│   │
│   ├── 📂 routes/
│   │   ├── 📄 categories.js             # Category routes (/api/categories)
│   │   ├── 📄 expenses.js               # Expense routes (/api/expenses)
│   │   └── 📄 dashboard.js              # Dashboard routes (/api/dashboard)
│   │
│   └── 📂 scripts/
│       └── 📄 initDatabase.js           # Database initialization script
│
└── 📂 frontend/                         # Vue.js Frontend
    ├── 📄 package.json                  # Frontend dependencies
    ├── 📄 index.html                    # HTML entry point
    ├── 📄 vite.config.js                # Vite configuration
    ├── 📄 tailwind.config.js            # Tailwind CSS config
    ├── 📄 postcss.config.js             # PostCSS config
    │
    └── 📂 src/
        ├── 📄 main.js                   # Vue app initialization
        ├── 📄 App.vue                   # Root component
        ├── 📄 style.css                 # Global styles (Tailwind)
        │
        ├── 📂 router/
        │   └── 📄 index.js              # Vue Router configuration
        │
        ├── 📂 services/
        │   └── 📄 api.js                # Axios API service
        │
        └── 📂 views/
            ├── 📄 Dashboard.vue         # Dashboard page (charts & analytics)
            └── 📄 Expenses.vue          # Expenses page (CRUD & filtering)
```

---

## 📊 Database Schema

### Categories Table
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT '💰',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

---

## 🔌 API Endpoints

### Categories API (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses API (`/api/expenses`)
- `GET /api/expenses` - Get all expenses (with filters)
  - Query params: `startDate`, `endDate`, `categoryId`, `sortBy`, `sortOrder`
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard API (`/api/dashboard`)
- `GET /api/dashboard/summary` - Get summary statistics
  - Query params: `startDate`, `endDate`
  - Returns: total_amount, total_transactions, average_amount, highest_expense
- `GET /api/dashboard/category-breakdown` - Get spending by category
  - Query params: `startDate`, `endDate`
  - Returns: Array of {category, amount, percentage}
- `GET /api/dashboard/monthly-trend` - Get monthly spending trend
  - Query params: `months` (default: 6)
  - Returns: Array of {month, total_amount, transaction_count}

---

## 🎨 Frontend Components

### Views
1. **Dashboard.vue**
   - Summary cards (total, transactions, average, highest)
   - Category breakdown with visual bars
   - Monthly trend chart (Chart.js)
   - Date range filtering

2. **Expenses.vue**
   - Expense list table
   - Add/Edit expense modal
   - Filtering (date range, category)
   - Sorting (date, amount, category)
   - Delete confirmation

### Services
- **api.js** - Centralized Axios instance for all API calls

### Router
- `/` - Dashboard
- `/expenses` - Expenses list

---

## 🛠️ Technologies Used

### Backend
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **dotenv** - Environment variables
- **cors** - Cross-origin requests
- **body-parser** - Request body parsing
- **nodemon** - Auto-restart on changes (dev)

### Frontend
- **Vue.js 3** - Frontend framework
- **Vue Router** - Routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool & dev server

### Database
- **MySQL 8.0+** - Relational database

---

## 🎯 Key Features

### ✅ Expense Management
- Add, edit, delete expenses
- Categorize expenses
- Add descriptions
- Set custom dates

### 📊 Dashboard Analytics
- Total expenses summary
- Transaction count
- Average expense
- Highest single expense
- Category breakdown with percentages
- Monthly spending trends (6-month chart)

### 🔍 Filtering & Sorting
- Filter by date range
- Filter by category
- Sort by date (newest/oldest)
- Sort by amount (highest/lowest)
- Sort by category name (A-Z/Z-A)

### 🎨 User Interface
- Responsive design (mobile-friendly)
- Clean, modern UI with Tailwind CSS
- Interactive charts
- Modal dialogs for forms
- Color-coded categories
- Icon support for categories

---

## 📦 Default Categories

The system comes with 8 pre-configured categories:

1. 🍔 Food & Dining (Red)
2. 🚗 Transportation (Blue)
3. 🛍️ Shopping (Purple)
4. 🎬 Entertainment (Pink)
5. 💡 Bills & Utilities (Amber)
6. ⚕️ Healthcare (Green)
7. 📚 Education (Cyan)
8. 📌 Other (Gray)

---

## 🔐 Environment Variables

### Backend (.env)
```
PORT=3000                    # Server port
DB_HOST=localhost            # MySQL host
DB_USER=expense_user         # MySQL username
DB_PASSWORD=expense_password # MySQL password
DB_NAME=expense_tracker      # Database name
DB_PORT=3306                 # MySQL port
```

---

## 📈 Data Flow

```
User Action (Frontend)
    ↓
Vue Component
    ↓
API Service (Axios)
    ↓
HTTP Request
    ↓
Express Route
    ↓
Controller
    ↓
Model
    ↓
MySQL Database
    ↓
Response (JSON)
    ↓
Frontend Update
```

---

## 🚀 Performance Features

- **Connection Pooling** - MySQL connection pool for efficiency
- **Promise-based** - All database operations use async/await
- **Optimized Queries** - Joins and aggregations done at database level
- **Efficient Filtering** - Server-side filtering and sorting
- **Lazy Loading** - Chart renders only when data is available

---

## 🔒 Security Considerations

- **Parameterized Queries** - Protection against SQL injection
- **CORS Enabled** - Controlled cross-origin access
- **Environment Variables** - Sensitive data not in code
- **Input Validation** - Backend validation for all inputs
- **Foreign Key Constraints** - Data integrity at database level

---

## 📝 File Descriptions

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Main server entry point, middleware setup, route mounting |
| `config/database.js` | MySQL connection pool configuration |
| `models/Expense.js` | Expense data model with CRUD and analytics methods |
| `models/Category.js` | Category data model with CRUD methods |
| `controllers/expenseController.js` | Request handlers for expense endpoints |
| `controllers/categoryController.js` | Request handlers for category endpoints |
| `controllers/dashboardController.js` | Request handlers for dashboard analytics |
| `routes/expenses.js` | Expense route definitions |
| `routes/categories.js` | Category route definitions |
| `routes/dashboard.js` | Dashboard route definitions |
| `scripts/initDatabase.js` | Database initialization with tables and sample data |

### Frontend Files

| File | Purpose |
|------|---------|
| `main.js` | Vue app initialization and plugin registration |
| `App.vue` | Root component with navigation |
| `views/Dashboard.vue` | Dashboard page with charts and summary cards |
| `views/Expenses.vue` | Expenses management page with CRUD operations |
| `services/api.js` | Centralized API service with all endpoints |
| `router/index.js` | Vue Router configuration and route definitions |
| `style.css` | Global styles and Tailwind CSS imports |
| `vite.config.js` | Vite build configuration and dev server proxy |
| `tailwind.config.js` | Tailwind CSS customization |

---

## 🎓 Learning Resources

This project demonstrates:
- RESTful API design
- MVC architecture
- MySQL database design
- Vue.js 3 Composition API
- Async/await patterns
- Promise-based operations
- Component-based architecture
- Responsive web design
- Chart.js integration
- Form handling and validation

---

**Total Files Created: 31**
**Lines of Code: ~2500+**
**Ready to use! 🎉**
