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
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ' || NEW.name || '</p>
          <p><strong>Email:</strong> ' || NEW.email || '</p>
          <p><strong>Phone:</strong> ' || NEW.phone || '</p>
          <p><strong>Message:</strong><br>' || NEW.message || '</p>
          <p><strong>Submitted at:</strong> ' || NEW.created_at || '</p>
        </div>
      </body>
    </html>';

  -- Send email using Supabase SMTP
  perform net.http_post(
    url := 'https://api.supabase.com/v1/email/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.smtp_key')
    ),
    body := jsonb_build_object(
      'to', current_setting('app.settings.notification_email'),
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
