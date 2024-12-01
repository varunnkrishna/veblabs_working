import { createClient } from '@supabase/supabase-js';

export default {
  async fetch(request, env) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsHeaders
        });
      }
      
      // Only allow POST requests
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders
        });
      }

      // Get form data
      const data = await request.json();
      console.log('Received data:', data);
      
      // Check environment variables
      if (!env.RESEND_API_KEY) {
        console.error('Missing RESEND_API_KEY');
        return new Response(
          JSON.stringify({ 
            error: 'Configuration error', 
            details: 'Email service not configured' 
          }), 
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (!env.RECIPIENT_EMAIL) {
        console.error('Missing RECIPIENT_EMAIL');
        return new Response(
          JSON.stringify({ 
            error: 'Configuration error', 
            details: 'Recipient email not configured' 
          }), 
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Initialize Supabase client
      const supabase = createClient('https://ucznehgalryyrjhucavz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjem5laGdhbHJ5eXJqaHVjYXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3ODM5NjMsImV4cCI6MjA0ODM1OTk2M30.Ty_xJ-3bMOrej8eEeN66CCYWKQKNkmgBQZH3eP--Rsc', {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      console.log('Supabase initialized');

      // Insert data into Supabase
      const { data: result, error: supabaseError } = await supabase
        .from('contacts')
        .insert([data]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return new Response(
          JSON.stringify({ 
            error: 'Database error', 
            details: supabaseError.message 
          }), 
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Send email using Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'VebLabs <hi@veblabs.com>',
          to: env.RECIPIENT_EMAIL,
          subject: 'New Contact Form Submission',
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.countryCode}${data.phone}</p>
            <p><strong>Message:</strong> ${data.message}</p>
          `
        })
      });

      if (!emailResponse.ok) {
        console.error('Email error:', await emailResponse.text());
        return new Response(
          JSON.stringify({ 
            error: 'Email error', 
            details: 'Failed to send email notification' 
          }), 
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          message: 'Form submitted successfully' 
        }), 
        { 
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (error) {
      console.error('Server error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error', 
          details: error.message 
        }), 
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
};

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
