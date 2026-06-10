
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
console.log("URL =", process.env.SUPABASE_URL);
console.log("KEY =", process.env.SUPABASE_KEY);
console.log("URL =", process.env.SUPABASE_URL);
console.log("KEY EXISTS =", !!process.env.SUPABASE_KEY);
if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL or SUPABASE_KEY missing in .env");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

module.exports = supabase;