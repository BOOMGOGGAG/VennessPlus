const mysql = require('mysql2/promise');
require('dotenv').config();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function initDatabase() {
  let connection;
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 2000;

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      console.log(`[Attempt ${i}/${MAX_RETRIES}] Connecting to MySQL server at ${process.env.DB_HOST}...`);

      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
      });

      console.log('✅ Connected to MySQL server successfully!');
      break;

    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);

      if (i === MAX_RETRIES) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`Waiting ${RETRY_DELAY/1000} seconds before retrying...`);
      await wait(RETRY_DELAY);
    }
  }

  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Drop the table
    await connection.query(`DROP TABLE IF EXISTS expenses`)
    await connection.query(`DROP TABLE IF EXISTS categories`)

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50) DEFAULT '💰',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table created');

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `);
    console.log('Expenses table created');

    // Insert default categories
    const defaultCategories = [
      ['Food & Dining', '#EF4444', '🍔'],
      ['Transportation', '#3B82F6', '🚗'],
      ['Shopping', '#8B5CF6', '🛍️'],
      ['Entertainment', '#EC4899', '🎬'],
      ['Bills & Utilities', '#F59E0B', '💡'],
      ['Healthcare', '#10B981', '⚕️'],
      ['Education', '#06B6D4', '📚'],
      ['Other', '#6B7280', '📌']
    ];

    for (const [name, color, icon] of defaultCategories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [name, color, icon]
      );
    }
    console.log('Default categories inserted');

    // Insert sample expenses
    const sampleExpenses = [
      // January 2025 - Starting point
      [85.50, 1, 'Grocery shopping at Whole Foods', '2025-01-05'],
      [45.00, 1, 'Lunch with colleagues', '2025-01-08'],
      [120.00, 1, 'Weekly groceries', '2025-01-12'],
      [35.00, 1, 'Coffee and breakfast', '2025-01-15'],
      [95.00, 1, 'Dinner party supplies', '2025-01-20'],
      [60.00, 1, 'Restaurant dinner', '2025-01-25'],
      
      [50.00, 2, 'Gas station fill-up', '2025-01-03'],
      [25.00, 2, 'Uber to airport', '2025-01-10'],
      [45.00, 2, 'Monthly parking', '2025-01-15'],
      [30.00, 2, 'Taxi fare', '2025-01-22'],
      
      [150.00, 3, 'New winter jacket', '2025-01-07'],
      [80.00, 3, 'Online shopping - books', '2025-01-14'],
      [200.00, 3, 'Electronics - headphones', '2025-01-28'],
      
      [40.00, 4, 'Movie tickets', '2025-01-11'],
      [75.00, 4, 'Concert tickets', '2025-01-19'],
      [30.00, 4, 'Streaming subscriptions', '2025-01-01'],
      
      [120.00, 5, 'Electricity bill', '2025-01-05'],
      [80.00, 5, 'Internet bill', '2025-01-05'],
      [65.00, 5, 'Water bill', '2025-01-05'],
      
      [50.00, 6, 'Pharmacy - medicine', '2025-01-17'],
      [150.00, 6, 'Doctor visit copay', '2025-01-24'],
      
      [200.00, 7, 'Online course subscription', '2025-01-02'],
      [45.00, 7, 'Books for study', '2025-01-16'],
      
      // February 2025 - Slight increase in dining
      [95.00, 1, 'Grocery shopping', '2025-02-02'],
      [55.00, 1, 'Restaurant lunch', '2025-02-06'],
      [130.00, 1, 'Weekly groceries', '2025-02-10'],
      [40.00, 1, 'Coffee shop', '2025-02-14'],
      [110.00, 1, 'Valentine dinner', '2025-02-14'],
      [70.00, 1, 'Family brunch', '2025-02-18'],
      [85.00, 1, 'Groceries', '2025-02-24'],
      
      [55.00, 2, 'Gas station', '2025-02-05'],
      [30.00, 2, 'Uber rides', '2025-02-12'],
      [45.00, 2, 'Parking fees', '2025-02-20'],
      [35.00, 2, 'Car wash', '2025-02-25'],
      
      [90.00, 3, 'Clothing purchase', '2025-02-08'],
      [120.00, 3, 'Home decor items', '2025-02-15'],
      [180.00, 3, 'New shoes', '2025-02-22'],
      
      [45.00, 4, 'Movie night', '2025-02-09'],
      [30.00, 4, 'Streaming services', '2025-02-01'],
      [60.00, 4, 'Game purchase', '2025-02-16'],
      
      [125.00, 5, 'Electricity bill', '2025-02-05'],
      [80.00, 5, 'Internet bill', '2025-02-05'],
      [70.00, 5, 'Phone bill', '2025-02-05'],
      
      [35.00, 6, 'Vitamins and supplements', '2025-02-11'],
      [80.00, 6, 'Dental checkup', '2025-02-19'],
      
      [50.00, 7, 'Educational materials', '2025-02-13'],
      
      // March 2025 - Transportation increases
      [100.00, 1, 'Monthly groceries', '2025-03-03'],
      [50.00, 1, 'Lunch meetings', '2025-03-07'],
      [115.00, 1, 'Grocery shopping', '2025-03-12'],
      [45.00, 1, 'Breakfast cafe', '2025-03-16'],
      [90.00, 1, 'Dinner out', '2025-03-21'],
      [75.00, 1, 'Weekend groceries', '2025-03-28'],
      
      [65.00, 2, 'Gas - price increase', '2025-03-04'],
      [40.00, 2, 'Uber to events', '2025-03-09'],
      [120.00, 2, 'Car maintenance', '2025-03-15'],
      [50.00, 2, 'Gas refill', '2025-03-22'],
      [45.00, 2, 'Parking tickets', '2025-03-27'],
      
      [200.00, 3, 'Spring wardrobe', '2025-03-10'],
      [95.00, 3, 'Amazon orders', '2025-03-18'],
      [150.00, 3, 'Furniture item', '2025-03-25'],
      
      [55.00, 4, 'Theater tickets', '2025-03-08'],
      [30.00, 4, 'Subscriptions', '2025-03-01'],
      [85.00, 4, 'Sports event', '2025-03-20'],
      
      [130.00, 5, 'Electricity bill', '2025-03-05'],
      [80.00, 5, 'Internet', '2025-03-05'],
      [75.00, 5, 'Gas bill', '2025-03-05'],
      
      [60.00, 6, 'Prescription refill', '2025-03-14'],
      [200.00, 6, 'Medical tests', '2025-03-23'],
      
      [100.00, 7, 'Workshop registration', '2025-03-11'],
      [40.00, 7, 'Study materials', '2025-03-19'],
      
      // April 2025 - Shopping spree
      [105.00, 1, 'Groceries', '2025-04-02'],
      [60.00, 1, 'Restaurant', '2025-04-08'],
      [125.00, 1, 'Weekly shopping', '2025-04-13'],
      [50.00, 1, 'Brunch', '2025-04-17'],
      [95.00, 1, 'Dinner party', '2025-04-24'],
      
      [55.00, 2, 'Gas', '2025-04-06'],
      [35.00, 2, 'Ride sharing', '2025-04-14'],
      [45.00, 2, 'Parking', '2025-04-21'],
      [60.00, 2, 'Gas refill', '2025-04-28'],
      
      [250.00, 3, 'Electronics - tablet', '2025-04-05'],
      [180.00, 3, 'Clothing haul', '2025-04-12'],
      [130.00, 3, 'Online shopping', '2025-04-19'],
      [220.00, 3, 'New laptop accessories', '2025-04-26'],
      
      [70.00, 4, 'Concert', '2025-04-10'],
      [30.00, 4, 'Streaming', '2025-04-01'],
      [95.00, 4, 'Entertainment package', '2025-04-22'],
      
      [135.00, 5, 'Electricity', '2025-04-05'],
      [80.00, 5, 'Internet', '2025-04-05'],
      [85.00, 5, 'Phone and cable', '2025-04-05'],
      
      [45.00, 6, 'Pharmacy', '2025-04-16'],
      
      [75.00, 7, 'Online course', '2025-04-09'],
      [55.00, 7, 'Books', '2025-04-23'],
      
      // May 2025 - Entertainment increases
      [110.00, 1, 'Groceries', '2025-05-04'],
      [65.00, 1, 'Dining out', '2025-05-09'],
      [130.00, 1, 'Weekly groceries', '2025-05-15'],
      [55.00, 1, 'Coffee meetings', '2025-05-20'],
      [100.00, 1, 'Restaurant dinner', '2025-05-27'],
      
      [60.00, 2, 'Gas', '2025-05-07'],
      [40.00, 2, 'Taxi', '2025-05-16'],
      [50.00, 2, 'Parking fees', '2025-05-24'],
      
      [160.00, 3, 'Summer clothes', '2025-05-11'],
      [95.00, 3, 'Home goods', '2025-05-19'],
      [140.00, 3, 'Gadgets', '2025-05-28'],
      
      [90.00, 4, 'Festival tickets', '2025-05-05'],
      [120.00, 4, 'Outdoor concert', '2025-05-12'],
      [30.00, 4, 'Subscriptions', '2025-05-01'],
      [85.00, 4, 'Movie marathon', '2025-05-18'],
      [110.00, 4, 'Amusement park', '2025-05-25'],
      
      [140.00, 5, 'Electricity - AC usage', '2025-05-05'],
      [80.00, 5, 'Internet', '2025-05-05'],
      [90.00, 5, 'Water bill', '2025-05-05'],
      
      [70.00, 6, 'Allergy medication', '2025-05-13'],
      [150.00, 6, 'Health checkup', '2025-05-22'],
      
      [90.00, 7, 'Certification exam', '2025-05-14'],
      
      // June 2025 - Summer vacation spending
      [120.00, 1, 'Groceries', '2025-06-03'],
      [75.00, 1, 'BBQ supplies', '2025-06-08'],
      [140.00, 1, 'Weekly shopping', '2025-06-14'],
      [90.00, 1, 'Restaurant', '2025-06-19'],
      [110.00, 1, 'Dinner party', '2025-06-26'],
      
      [70.00, 2, 'Gas for road trip', '2025-06-06'],
      [85.00, 2, 'More gas', '2025-06-13'],
      [50.00, 2, 'Uber rides', '2025-06-21'],
      [65.00, 2, 'Parking', '2025-06-28'],
      
      [180.00, 3, 'Beach gear', '2025-06-10'],
      [220.00, 3, 'Travel accessories', '2025-06-17'],
      [150.00, 3, 'Summer wardrobe', '2025-06-24'],
      
      [150.00, 4, 'Theme park tickets', '2025-06-07'],
      [200.00, 4, 'Outdoor activities', '2025-06-15'],
      [30.00, 4, 'Streaming', '2025-06-01'],
      [95.00, 4, 'Beach resort day pass', '2025-06-22'],
      
      [150.00, 5, 'AC - high usage', '2025-06-05'],
      [80.00, 5, 'Internet', '2025-06-05'],
      [95.00, 5, 'Phone bill', '2025-06-05'],
      
      [55.00, 6, 'Sunscreen and first aid', '2025-06-12'],
      [100.00, 6, 'Travel vaccinations', '2025-06-20'],
      
      [120.00, 7, 'Summer workshop', '2025-06-16'],
      [60.00, 7, 'Learning materials', '2025-06-25'],
      
      // July 2025 - Peak summer
      [130.00, 1, 'Groceries', '2025-07-02'],
      [85.00, 1, 'Dining', '2025-07-09'],
      [145.00, 1, 'BBQ party supplies', '2025-07-16'],
      [95.00, 1, 'Restaurant', '2025-07-23'],
      
      [75.00, 2, 'Gas', '2025-07-05'],
      [90.00, 2, 'Road trip gas', '2025-07-12'],
      [55.00, 2, 'Parking and tolls', '2025-07-19'],
      
      [200.00, 3, 'Vacation shopping', '2025-07-08'],
      [170.00, 3, 'Camping equipment', '2025-07-15'],
      
      [180.00, 4, 'Water park tickets', '2025-07-06'],
      [220.00, 4, 'Vacation activities', '2025-07-13'],
      [30.00, 4, 'Subscriptions', '2025-07-01'],
      [130.00, 4, 'Beach club membership', '2025-07-20'],
      
      [160.00, 5, 'Peak AC usage', '2025-07-05'],
      [80.00, 5, 'Internet', '2025-07-05'],
      [100.00, 5, 'Water bill', '2025-07-05'],
      
      [65.00, 6, 'Travel health kit', '2025-07-14'],
      
      [40.00, 7, 'Travel guides', '2025-07-11'],
      
      // August 2025 - Back to school prep
      [125.00, 1, 'Groceries', '2025-08-03'],
      [80.00, 1, 'Family dinner', '2025-08-10'],
      [135.00, 1, 'Weekly shopping', '2025-08-17'],
      [100.00, 1, 'Restaurant', '2025-08-24'],
      
      [70.00, 2, 'Gas', '2025-08-07'],
      [45.00, 2, 'Uber', '2025-08-14'],
      [65.00, 2, 'Gas refill', '2025-08-21'],
      
      [250.00, 3, 'Back to school shopping', '2025-08-06'],
      [180.00, 3, 'School supplies', '2025-08-13'],
      [150.00, 3, 'Clothing for school', '2025-08-20'],
      [200.00, 3, 'Backpack and accessories', '2025-08-27'],
      
      [100.00, 4, 'Summer finale events', '2025-08-09'],
      [30.00, 4, 'Subscriptions', '2025-08-01'],
      [75.00, 4, 'Last vacation activities', '2025-08-16'],
      
      [155.00, 5, 'Electricity', '2025-08-05'],
      [80.00, 5, 'Internet', '2025-08-05'],
      [90.00, 5, 'Phone bill', '2025-08-05'],
      
      [85.00, 6, 'Annual checkup', '2025-08-15'],
      [120.00, 6, 'Dental cleaning', '2025-08-22'],
      
      [300.00, 7, 'School tuition payment', '2025-08-05'],
      [150.00, 7, 'Textbooks', '2025-08-12'],
      [90.00, 7, 'School materials', '2025-08-19'],
      [120.00, 7, 'Online courses', '2025-08-26'],
      
      // September 2025 - School in session
      [115.00, 1, 'Groceries', '2025-09-02'],
      [70.00, 1, 'School lunch prep', '2025-09-08'],
      [130.00, 1, 'Weekly groceries', '2025-09-15'],
      [85.00, 1, 'Family dinner', '2025-09-22'],
      
      [65.00, 2, 'Gas', '2025-09-05'],
      [50.00, 2, 'School commute', '2025-09-12'],
      [60.00, 2, 'Gas refill', '2025-09-19'],
      
      [140.00, 3, 'Fall wardrobe', '2025-09-09'],
      [100.00, 3, 'School extras', '2025-09-16'],
      
      [60.00, 4, 'Weekend activities', '2025-09-06'],
      [30.00, 4, 'Subscriptions', '2025-09-01'],
      [80.00, 4, 'Family entertainment', '2025-09-20'],
      
      [145.00, 5, 'Electricity', '2025-09-05'],
      [80.00, 5, 'Internet', '2025-09-05'],
      [85.00, 5, 'Phone and utilities', '2025-09-05'],
      
      [50.00, 6, 'Flu shots', '2025-09-18'],
      
      [200.00, 7, 'Extra tutoring', '2025-09-10'],
      [80.00, 7, 'Study materials', '2025-09-17'],
      
      // October 2025 - Halloween and fall
      [120.00, 1, 'Groceries', '2025-10-04'],
      [75.00, 1, 'Dining out', '2025-10-11'],
      [135.00, 1, 'Halloween party food', '2025-10-18'],
      [90.00, 1, 'Weekly groceries', '2025-10-25'],
      
      [60.00, 2, 'Gas', '2025-10-07'],
      [45.00, 2, 'Parking', '2025-10-14'],
      [55.00, 2, 'Gas refill', '2025-10-21'],
      
      [110.00, 3, 'Halloween costumes', '2025-10-08'],
      [85.00, 3, 'Fall decorations', '2025-10-15'],
      [150.00, 3, 'Winter prep shopping', '2025-10-22'],
      
      [95.00, 4, 'Halloween events', '2025-10-12'],
      [30.00, 4, 'Subscriptions', '2025-10-01'],
      [70.00, 4, 'Fall festival', '2025-10-19'],
      [120.00, 4, 'Pumpkin patch and activities', '2025-10-26'],
      
      [140.00, 5, 'Heating starts', '2025-10-05'],
      [80.00, 5, 'Internet', '2025-10-05'],
      [90.00, 5, 'Phone bill', '2025-10-05'],
      
      [75.00, 6, 'Cold medicine stock', '2025-10-16'],
      
      [100.00, 7, 'Course materials', '2025-10-13'],
      
      // November 2025 - Thanksgiving prep
      [140.00, 1, 'Thanksgiving groceries', '2025-11-03'],
      [200.00, 1, 'Turkey and fixings', '2025-11-10'],
      [165.00, 1, 'Holiday meal prep', '2025-11-17'],
      [95.00, 1, 'Weekly groceries', '2025-11-24'],
      
      [65.00, 2, 'Gas', '2025-11-06'],
      [80.00, 2, 'Holiday travel gas', '2025-11-13'],
      [55.00, 2, 'Local trips', '2025-11-20'],
      
      [180.00, 3, 'Black Friday shopping', '2025-11-28'],
      [220.00, 3, 'Holiday gift shopping', '2025-11-15'],
      [130.00, 3, 'Winter clothes', '2025-11-08'],
      
      [85.00, 4, 'Movie releases', '2025-11-09'],
      [30.00, 4, 'Subscriptions', '2025-11-01'],
      [110.00, 4, 'Thanksgiving activities', '2025-11-22'],
      
      [150.00, 5, 'Heating bill increase', '2025-11-05'],
      [80.00, 5, 'Internet', '2025-11-05'],
      [95.00, 5, 'Phone and gas', '2025-11-05'],
      
      [60.00, 6, 'Winter health prep', '2025-11-14'],
      
      [150.00, 7, 'Workshop enrollment', '2025-11-11'],
      
      // December 2025 - Holiday season
      [150.00, 1, 'Holiday party groceries', '2025-12-02'],
      [185.00, 1, 'Christmas dinner shopping', '2025-12-09'],
      [120.00, 1, 'New Year prep', '2025-12-16'],
      [95.00, 1, 'Weekly groceries', '2025-12-23'],
      
      [70.00, 2, 'Gas', '2025-12-05'],
      [90.00, 2, 'Holiday travel', '2025-12-12'],
      [60.00, 2, 'Local errands', '2025-12-19'],
      
      [300.00, 3, 'Christmas gifts', '2025-12-06'],
      [250.00, 3, 'More holiday shopping', '2025-12-13'],
      [180.00, 3, 'Last minute gifts', '2025-12-20'],
      [150.00, 3, 'New Year outfit', '2025-12-27'],
      
      [120.00, 4, 'Holiday shows', '2025-12-07'],
      [30.00, 4, 'Subscriptions', '2025-12-01'],
      [95.00, 4, 'Christmas movies and events', '2025-12-14'],
      [140.00, 4, 'New Year celebration', '2025-12-31'],
      
      [160.00, 5, 'Peak heating', '2025-12-05'],
      [80.00, 5, 'Internet', '2025-12-05'],
      [100.00, 5, 'Phone and utilities', '2025-12-05'],
      
      [55.00, 6, 'Cold and flu season', '2025-12-11'],
      
      [80.00, 7, 'End of year courses', '2025-12-15']
    ];

    for (const [amount, category_id, description, expense_date] of sampleExpenses) {
      await connection.query(
        'INSERT INTO expenses (amount, category_id, description, expense_date) VALUES (?, ?, ?, ?)',
        [amount, category_id, description, expense_date]
      );
    }
    console.log('Sample expenses inserted');

    console.log('\n✅ Database initialization completed successfully!');

    await connection.end()
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }

}

module.exports = initDatabase;