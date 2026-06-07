const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

console.log("URL =", process.env.SUPABASE_URL);
console.log("KEY =", process.env.SUPABASE_KEY);
console.log("URL =", process.env.SUPABASE_URL);
console.log("KEY EXISTS =", !!process.env.SUPABASE_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;