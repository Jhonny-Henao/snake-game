import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpwdypmlswzwggzyjgmh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwd2R5cG1sc3d6d2dnenlqZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjkzMjcsImV4cCI6MjA3NjY0NTMyN30.iXqnFp50AXDRLsbWuKnRgMiD8IwrhMz90GwSrSiA3gs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)