-- Enable the pgnet extension if not already enabled
create extension if not exists "pg_net";

-- Create the notification function
create or replace function notify_contact_submission()
returns trigger
security definer
language plpgsql
as $$
declare
  email_body text;
begin
  -- Create HTML email body
  email_body := '
    <!DOCTYPE html>
    <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Contact Form Submission</h2>
          <p style="color: #64748b; margin: 0;">You have received a new contact form submission from your website.</p>
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
          
          <div style="font-size: 14px; color: #64748b;">
            <p style="margin: 0;">Submitted at: ' || to_char(NEW.created_at, ''YYYY-MM-DD HH24:MI:SS'') || '</p>
          </div>
        </div>
      </body>
    </html>';

  -- Send email using Resend API
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.resend_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', current_setting('app.settings.from_email'),
      'to', current_setting('app.settings.to_email'),
      'subject', 'New Contact Form Submission - ' || NEW.name,
      'html', email_body
    )
  );

  return NEW;
end;
$$;

-- Create or replace the trigger
drop trigger if exists contact_submission_notification on contact_submissions;
create trigger contact_submission_notification
  after insert on contact_submissions
  for each row
  execute function notify_contact_submission();
