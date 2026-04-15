import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://keqcwltxiurnkaqbervy.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcWN3bHR4aXVybmthcWJlcnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTc1ODksImV4cCI6MjA4OTE3MzU4OX0.bVV6sYzE3T4bWl5wz--F_5pB1UzFOTl8QTT2hqqlvzo"

export const supabase = createClient(supabaseUrl, supabaseKey)