const pool = require("./src/config/db");

async function test() {
  try {
    const result = await pool.query(
      "SELECT NOW(), current_database(), current_user"
    );

    console.log("✅ Connection successful!");
    console.log(result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

test();