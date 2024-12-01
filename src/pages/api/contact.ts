import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  form_type?: string;
  status?: string;
}

export const POST: APIRoute = async ({ request }) => {
  console.log('API: Received request');
  console.log('API: Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Verify content type
    const contentType = request.headers.get('content-type');
    console.log('API: Content-Type header:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('API: Invalid content type:', contentType);
      return new Response(
        JSON.stringify({
          error: 'Content-Type must be application/json',
          receivedContentType: contentType
        }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    // Parse request body
    let data: ContactForm;
    try {
      data = await request.json();
      console.log('API: Parsed form data:', data);
    } catch (parseError) {
      console.error('API: JSON parse error:', parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON format'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'message'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number format (including country code)
    if (!/^\+[0-9]{1,4}[0-9]{6,14}$/.test(data.phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare form data
    const formData = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      message: data.message.trim(),
      form_type: 'main',
      status: 'new'
    };

    console.log('API: Inserting data:', formData);

    // Insert into Supabase
    const { data: result, error: insertError } = await supabase
      .from('contact_submissions')
      .insert([formData])
      .select()
      .single();

    if (insertError) {
      console.error('API: Supabase insert error:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Database error',
          details: insertError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('API: Successfully inserted data:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        data: result
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
