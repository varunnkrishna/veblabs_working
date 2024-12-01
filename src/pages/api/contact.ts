import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { Resend } from 'resend';

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
  
  try {
    // Log environment variables (without exposing sensitive data)
    console.log('API: Environment variables check:');
    console.log('- RESEND_API_KEY type:', typeof import.meta.env.RESEND_API_KEY);
    console.log('- RESEND_API_KEY length:', import.meta.env.RESEND_API_KEY?.length || 0);
    console.log('- RECIPIENT_EMAIL:', import.meta.env.RECIPIENT_EMAIL);
    console.log('- Process env keys:', Object.keys(process.env).join(', '));
    console.log('- Import.meta.env keys:', Object.keys(import.meta.env).join(', '));

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
          error: 'Invalid JSON format',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
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
        console.error(`API: Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      console.error('API: Invalid email format:', data.email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number format (including country code)
    if (!/^\+[0-9]{1,4}[0-9]{6,14}$/.test(data.phone)) {
      console.error('API: Invalid phone number format:', data.phone);
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

    console.log('API: Inserting data into Supabase');

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

    console.log('API: Successfully inserted data, sending email');

    // Send email notification using Resend
    if (!import.meta.env.RESEND_API_KEY) {
      console.error('API: Missing RESEND_API_KEY');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Email service not configured properly. RESEND_API_KEY is missing.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!import.meta.env.RECIPIENT_EMAIL) {
      console.error('API: Missing RECIPIENT_EMAIL');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Email service not configured properly. RECIPIENT_EMAIL is missing.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    let emailError = null;
    try {
      const emailResult = await resend.emails.send({
        from: 'VebLabs <onboarding@resend.dev>',
        to: import.meta.env.RECIPIENT_EMAIL,
        subject: `New Contact Form Submission from ${formData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message}</p>
        `
      });
      console.log('API: Email sent successfully:', emailResult);
    } catch (err) {
      emailError = err;
      console.error('API: Email sending error:', err);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
        data: result,
        warnings: emailError ? ['Email notification delayed but your message was saved'] : undefined
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API: Unexpected error:', error);
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('API: Environment check on error:');
    console.error('- RESEND_API_KEY exists:', !!import.meta.env.RESEND_API_KEY);
    console.error('- RECIPIENT_EMAIL exists:', !!import.meta.env.RECIPIENT_EMAIL);
    console.error('- PUBLIC_SUPABASE_URL exists:', !!import.meta.env.PUBLIC_SUPABASE_URL);
    console.error('- PUBLIC_SUPABASE_ANON_KEY exists:', !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
