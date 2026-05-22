// testDb.js
const pool = require("./config/db");

async function test() {
  try {
    console.log("🔄 Attempting connection...");
    
    const result = await pool.query("SELECT NOW(), current_database(), current_user");
    
    console.log("✅ Connection successful!");
    console.log("Database:", result.rows[0].current_database);
    console.log("User:", result.rows[0].current_user);
    console.log("Time:", result.rows[0].now);
    
    // Test your users table
    const users = await pool.query("SELECT * FROM users LIMIT 5");
    console.log("\n📊 Users table:");
    console.log(users.rows);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

test();