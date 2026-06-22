
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sayyetzabdhremtxxunw.supabase.co";

const supabaseAnonKey =   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheXlldHphYmRocmVtdHh4dW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDk3OTEsImV4cCI6MjA5NTAyNTc5MX0.l0UD_wdWI2RQzWHdADDe79tD1_DcNTWqOGFNo2MrWZA"; 
;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;