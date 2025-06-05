import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  send: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      email: z.string().email(),
      msg: z.string(),
      website: z.string().optional(),
    }),
    handler: async ({name, email, msg, website}) => {
      // dont send email if the website field is filled out cuz a bot did it
      if (website) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Bot detected: form submitted with website field filled out.',
        });
      }

      console.log('Sending email...');
      const { data, error } = await resend.emails.send({
        from:'Bright N Lucky <contact@brightnlucky.com>',
        replyTo: `${name} <${email}>`,
        to: ['BrightNLuckyFaces@gmail.com'],
        subject: 'New message from brightnlucky.com',
        html: `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8f8f8; padding: 1em; border-radius: 6px; border: 1px solid #e0e0e0;">
            ${msg.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <small>This message was sent from the contact form on brightnlucky.com</small>
        </div>`,
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      console.log(`Email sent from ${name}`);
      return data;
    },
  }),
};
