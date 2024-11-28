-- Enable required extension
create extension if not exists "pg_net";

-- Create settings table
create table if not exists app_settings (
    key text primary key,
    value text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Insert settings with your actual values
insert into app_settings (key, value)
values 
    ('resend_key', 're_7L6JK8r7_MCjKdM4Fc1tHQQpLszGkRsf4'),
    ('from_email', 'hi@veblabs.com'),
    ('to_email', 'veblabs90@gmail.com')
on conflict (key) do update 
    set value = excluded.value,
        updated_at = now();

-- Create a logging table for email responses
create table if not exists email_logs (
    id serial primary key,
    email_type text not null,
    recipient text not null,
    response jsonb,
    created_at timestamp with time zone default now()
);

-- Create notification function
create or replace function notify_contact_submission()
returns trigger
security definer
language plpgsql
as $$
declare
    email_body text;
    auto_reply_body text;
    resend_key text;
    from_email text;
    to_email text;
    admin_response jsonb;
    client_response jsonb;
begin
    -- Get settings
    select value into resend_key from app_settings where key = 'resend_key';
    select value into from_email from app_settings where key = 'from_email';
    select value into to_email from app_settings where key = 'to_email';

    raise notice 'Sending emails with from_email: %, to admin: %, to client: %', from_email, to_email, NEW.email;

    -- Create HTML email body for admin notification
    email_body := '
        <!DOCTYPE html>
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin-top: 0;">New Contact Form Submission</h2>
              <p style="color: #64748b; margin: 0;">You have received a new contact form submission from VEB Labs website.</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 16px;">
                <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Contact Details</p>
                <p style="margin: 0;"><strong>Name:</strong> ' || NEW.name || '</p>
                <p style="margin: 0;"><strong>Email:</strong> ' || NEW.email || '</p>
                <p style="margin: 0;"><strong>Phone:</strong> ' || NEW.phone || '</p>
              </div>
              
              <div style="margin-bottom: 16px;">
                <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Message</p>
                <p style="margin: 0; white-space: pre-wrap;">' || NEW.message || '</p>
              </div>
              
              <div style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; margin-top: 16px; padding-top: 16px;">
                <p style="margin: 0;">Submitted at: ' || to_char(NEW.created_at, 'YYYY-MM-DD HH24:MI:SS') || '</p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #64748b;">
              <p style="margin: 0;">This is an automated message from VEB Labs Contact Form</p>
            </div>
          </body>
        </html>';

    -- Create HTML email body for auto-reply
    auto_reply_body := '
        <!DOCTYPE html>
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin-top: 0;">Thank You for Contacting VEB Labs</h2>
              <p style="color: #64748b; margin: 0;">We have received your message and appreciate your interest.</p>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
              <p>Dear ' || NEW.name || ',</p>
              
              <p>Thank you for reaching out to VEB Labs. This email confirms that we have received your message.</p>
              
              <p>Our team will review your inquiry and get back to you as soon as possible. We typically respond within 24-48 business hours.</p>
              
              <p>For your reference, here is a copy of your message:</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <p style="margin: 0; white-space: pre-wrap;">' || NEW.message || '</p>
              </div>
              
              <p>If you have any urgent concerns, please feel free to reach out to us directly at hi@veblabs.com.</p>
              
              <p>Best regards,<br>The VEB Labs Team</p>
            </div>

            <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #64748b;">
              <p style="margin: 0;">This is an automated response. Please do not reply to this email.</p>
            </div>
          </body>
        </html>';

    -- Send notification email to admin
    select content::jsonb into admin_response from net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || resend_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', from_email,
            'to', to_email,
            'reply_to', NEW.email,
            'subject', 'New Contact Form Submission - ' || NEW.name,
            'html', email_body
        )
    );

    -- Log admin email response
    insert into email_logs (email_type, recipient, response)
    values ('admin', to_email, admin_response);

    -- Send auto-reply to client
    select content::jsonb into client_response from net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || resend_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', from_email,
            'to', NEW.email,
            'reply_to', from_email,
            'subject', 'Thank You for Contacting VEB Labs',
            'html', auto_reply_body
        )
    );

    -- Log client email response
    insert into email_logs (email_type, recipient, response)
    values ('client', NEW.email, client_response);

    -- Log responses
    raise notice 'Admin email response: %', admin_response;
    raise notice 'Client email response: %', client_response;

    return NEW;
end;
$$;

-- Create trigger
drop trigger if exists contact_submission_notification on contact_submissions;
create trigger contact_submission_notification
    after insert on contact_submissions
    for each row
    execute function notify_contact_submission();

-- Set up RLS policies
alter table app_settings enable row level security;
alter table email_logs enable row level security;

create policy "Allow select for authenticated users only"
    on app_settings for select
    to authenticated
    using (true);

create policy "Allow all for authenticated users"
    on email_logs for all
    to authenticated
    using (true);
