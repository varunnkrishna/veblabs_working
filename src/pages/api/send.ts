import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const subject = formData.get("subject")?.toString() || "";
  const message = formData.get("message")?.toString() || "";

  try {
    // Send notification email to recipient
    const { error: notificationError } = await resend.emails.send({
      from: "Your Website <onboarding@resend.dev>",
      to: import.meta.env.RECIPIENT_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (notificationError) {
      return new Response(
        JSON.stringify({ error: notificationError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send acknowledgment email to user
    const { error: acknowledgmentError } = await resend.emails.send({
      from: "hi@veblabs.com",
      to: email,
      subject: "We've Received Your Message",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank You for Contacting Us</h1>
          <p>Dear ${name},</p>
          <p>We've received your message regarding "${subject}" and wanted to let you know that we'll review it shortly.</p>
          <p>Here's a copy of your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${message}
          </div>
          <p>We'll get back to you as soon as possible at ${email}.</p>
          <p>Best regards,<br>Your Team Name</p>
        </div>
      `,
    });

    if (acknowledgmentError) {
      // Log the error but don't fail the request since the main notification was sent
      console.error(
        "Failed to send acknowledgment email:",
        acknowledgmentError
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
