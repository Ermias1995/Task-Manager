import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// 1. Define CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. Handle Preflight Request (Required for CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. Create Supabase Client with User Context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 4. Parse Body
    const { project_id } = await req.json()

    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id is required' }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    // 5. Query Database
    const { data, error } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('project_id', project_id)
      .lt('due_date', new Date().toISOString())
      .neq('status', 'done')

    if (error) {
      console.error("DB Error:", error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    // 6. Return Response WITH CORS Headers
    return new Response(JSON.stringify({ overdue_count: data.length, tasks: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("Server Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})