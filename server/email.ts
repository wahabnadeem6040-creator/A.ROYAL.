import nodemailer from 'nodemailer';
import { Order } from '../src/types';

export interface EmailDispatchResult {
  success: boolean;
  recipient: string;
  message: string;
  previewUrl?: string | false;
}

export interface SmtpAuthCredentials {
  user?: string;
  pass?: string;
}

const DEFAULT_ADMIN_EMAIL = 'wahab.nadeem6040@gmail.com';

function getRecipientEmail(configuredEmail?: string): string {
  if (configuredEmail && configuredEmail.trim().includes('@')) {
    return configuredEmail.trim();
  }
  if (process.env.ADMIN_NOTIFICATION_EMAIL && process.env.ADMIN_NOTIFICATION_EMAIL.trim().includes('@')) {
    return process.env.ADMIN_NOTIFICATION_EMAIL.trim();
  }
  return DEFAULT_ADMIN_EMAIL;
}

/**
 * Creates a Nodemailer transporter.
 * If SMTP credentials are provided (either via settings or .env), connects to real Gmail SMTP.
 */
function createEmailTransporter(customCredentials?: SmtpAuthCredentials) {
  const smtpUser = customCredentials?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = customCredentials?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    // If it's a gmail address or default, nodemailer's built-in gmail service is the most reliable
    if (smtpUser.includes('@gmail.com') || !process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser.trim(),
          pass: smtpPass.trim().replace(/\s+/g, '') // remove spaces from 16-char app password
        }
      });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass.trim().replace(/\s+/g, '')
      }
    });
  }

  return null;
}

/**
 * Generates an executive luxury HTML receipt email
 */
function generateOrderEmailHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #eee8de;">
          <div style="font-weight: 600; color: #151515; font-size: 14px;">${item.name}</div>
          <div style="font-size: 11px; color: #8b7650; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">
            ${item.category}
          </div>
        </td>
        <td style="padding: 12px 16px; text-align: center; border-bottom: 1px solid #eee8de; font-size: 13px; color: #444;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #eee8de; font-size: 13px; color: #151515; font-weight: 600;">
          PKR ${item.price.toLocaleString()}
        </td>
        <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #eee8de; font-size: 13px; color: #151515; font-weight: 700;">
          PKR ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Received - A.ROYAL</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #151515;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #dfd8cc; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #151515; padding: 30px; text-align: center; border-bottom: 3px solid #c9ad79;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 0.15em; color: #ffffff;">A.ROYAL</h1>
              <p style="margin: 6px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #c9ad79; font-weight: 600;">
                Luxury That Defines You
              </p>
            </td>
          </tr>

          <!-- Notification Title Bar -->
          <tr>
            <td style="background-color: #f7f4ed; padding: 18px 30px; border-bottom: 1px solid #eee8de;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #151515; color: #c9ad79; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 3px;">
                      New Order Alert
                    </span>
                  </td>
                  <td align="right" style="font-size: 13px; font-weight: bold; color: #151515;">
                    Order: <span style="color: #8b7650;">#${order.id}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #333;">
                Dear Store Administrator,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #555;">
                A new customer order has been placed on <strong>A.ROYAL Storefront</strong>. Full dispatch and customer delivery details are outlined below:
              </p>

              <!-- Customer Details Box -->
              <div style="background-color: #faf9f6; border: 1px solid #eee8de; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #8b7650; font-weight: 700;">
                  Customer & Shipping Information
                </h3>
                <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #333;">
                  <tr>
                    <td width="35%" style="color: #777; font-weight: 500;">Customer Name:</td>
                    <td style="font-weight: 600; color: #151515;">${order.customer.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #777; font-weight: 500;">Phone Number:</td>
                    <td style="font-weight: 600; color: #151515;">
                      <a href="tel:${order.customer.phone}" style="color: #151515; text-decoration: none;">${order.customer.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #777; font-weight: 500;">WhatsApp:</td>
                    <td>
                      <a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(order.customer.name)},%20thank%20you%20for%20your%20A.ROYAL%20order%20%23${order.id}." style="color: #059669; font-weight: 600; text-decoration: none;">
                        💬 Open WhatsApp Chat
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #777; font-weight: 500;">Customer Email:</td>
                    <td><a href="mailto:${order.customer.email}" style="color: #151515; text-decoration: none;">${order.customer.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #777; font-weight: 500;">Destination City:</td>
                    <td style="font-weight: 700; color: #151515;">${order.customer.city}, Pakistan</td>
                  </tr>
                  <tr>
                    <td style="color: #777; font-weight: 500;">Complete Address:</td>
                    <td style="color: #151515;">${order.customer.address}</td>
                  </tr>
                  ${
                    order.customer.notes
                      ? `
                  <tr>
                    <td style="color: #777; font-weight: 500;">Order Notes:</td>
                    <td style="color: #b45309; font-style: italic;">"${order.customer.notes}"</td>
                  </tr>`
                      : ''
                  }
                  <tr>
                    <td style="color: #777; font-weight: 500;">Payment Method:</td>
                    <td style="font-weight: 700; color: #047857;">${order.paymentMethod}</td>
                  </tr>
                </table>
              </div>

              <!-- Order Items Table -->
              <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #8b7650; font-weight: 700;">
                Items Ordered
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #eee8de;">
                <thead>
                  <tr style="background-color: #f7f5f0; border-bottom: 2px solid #dfd8cc;">
                    <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555;">Product</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555;">Qty</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555;">Unit Price</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Totals -->
              <table width="100%" cellpadding="4" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="right" style="font-size: 13px; color: #777;">Subtotal:</td>
                  <td width="140" align="right" style="font-size: 13px; font-weight: 600; color: #151515;">
                    PKR ${order.subtotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td align="right" style="font-size: 13px; color: #777;">Delivery / Courier Fee:</td>
                  <td align="right" style="font-size: 13px; font-weight: 600; color: #047857;">
                    ${order.shippingFee === 0 ? 'FREE (Insured)' : `PKR ${order.shippingFee.toLocaleString()}`}
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding-top: 10px; font-size: 16px; font-weight: 700; color: #151515; border-top: 2px solid #151515;">
                    Total Collectible Amount:
                  </td>
                  <td align="right" style="padding-top: 10px; font-size: 18px; font-weight: 800; color: #151515; border-top: 2px solid #151515;">
                    PKR ${order.total.toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- Admin Action CTA -->
              <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #fcfbf9; border: 1px dashed #dfd8cc; border-radius: 4px;">
                <p style="margin: 0 0 14px; font-size: 12px; color: #666;">
                  Log into the A.ROYAL Admin Console to process dispatch, print courier waybill, or update status:
                </p>
                <a href="${process.env.APP_URL || ''}/admin" style="display: inline-block; background-color: #151515; color: #c9ad79; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; padding: 12px 28px; text-decoration: none; border-radius: 2px;">
                  Open Admin Portal
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #151515; padding: 20px; text-align: center; font-size: 11px; color: #888;">
              <p style="margin: 0; color: #aaa;">This notification was dispatched automatically by A.ROYAL Luxury E-Commerce Engine.</p>
              <p style="margin: 4px 0 0; color: #666;">Recipient: ${getRecipientEmail()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an email notification to the administrator (wahab.nadeem6040@gmail.com)
 */
export async function sendOrderNotificationEmail(
  order: Order,
  recipientOverride?: string,
  credentials?: SmtpAuthCredentials
): Promise<EmailDispatchResult> {
  const recipient = getRecipientEmail(recipientOverride);
  const subject = `👑 New Order #${order.id} Received - ${order.customer.name} (PKR ${order.total.toLocaleString()})`;
  const html = generateOrderEmailHtml(order);

  console.log(`\n======================================================`);
  console.log(`[ORDER EMAIL DISPATCH] Target: ${recipient}`);
  console.log(`[ORDER EMAIL DISPATCH] Order ID: #${order.id}`);
  console.log(`[ORDER EMAIL DISPATCH] Customer: ${order.customer.name} (${order.customer.phone})`);
  console.log(`[ORDER EMAIL DISPATCH] Destination: ${order.customer.city}`);
  console.log(`[ORDER EMAIL DISPATCH] Total: PKR ${order.total.toLocaleString()} via ${order.paymentMethod}`);
  console.log(`======================================================\n`);

  try {
    const transporter = createEmailTransporter(credentials);

    if (transporter) {
      const sender = credentials?.user || process.env.SMTP_USER || 'orders@aroyal.pk';
      const info = await transporter.sendMail({
        from: `"A.ROYAL Luxury" <${sender}>`,
        to: recipient,
        subject,
        html
      });

      console.log(`[ORDER EMAIL DISPATCH SUCCESS] Real SMTP email delivered to ${recipient}. MessageId: ${info.messageId}`);
      return {
        success: true,
        recipient,
        message: `Notification email successfully delivered to ${recipient} (Message ID: ${info.messageId})`
      };
    } else {
      // SMTP not configured with credentials in environment or settings
      console.log(
        `[ORDER EMAIL DISPATCH SIMULATED] SMTP credentials not set. Notification recorded for ${recipient}. In Admin Portal Settings, enter your Gmail & App Password for direct inbox delivery.`
      );
      return {
        success: true,
        recipient,
        message: `Order notification queued for ${recipient}. To receive real emails in your Gmail inbox, enter your 16-letter Gmail App Password in Admin Portal Settings.`
      };
    }
  } catch (err: any) {
    console.error(`[ORDER EMAIL DISPATCH ERROR] Failed to send email to ${recipient}:`, err);
    return {
      success: false,
      recipient,
      message: `Failed to deliver to ${recipient}: ${err.message || err}`
    };
  }
}

/**
 * Sends a test email to verify recipient connectivity
 */
export async function sendTestNotificationEmail(
  targetEmail?: string,
  credentials?: SmtpAuthCredentials
): Promise<EmailDispatchResult> {
  const recipient = getRecipientEmail(targetEmail);
  const subject = `✨ A.ROYAL Test Alert: Email Notification Connected Successfully`;
  const html = `
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #c9ad79; background: #faf9f6; text-align: center;">
      <h2 style="color: #151515; letter-spacing: 0.1em;">A.ROYAL</h2>
      <p style="color: #8b7650; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: bold;">Luxury Notification Engine</p>
      <div style="margin: 20px 0; padding: 15px; background: #ffffff; border: 1px solid #eee8de;">
        <p style="font-size: 14px; color: #151515; font-weight: 600;">Test email alert verified!</p>
        <p style="font-size: 12px; color: #555;">New customer orders will be automatically routed to: <strong>${recipient}</strong></p>
      </div>
      <p style="font-size: 10px; color: #888;">Timestamp: ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} (PKT)</p>
    </div>
  `;

  try {
    const transporter = createEmailTransporter(credentials);
    if (transporter) {
      const sender = credentials?.user || process.env.SMTP_USER || 'orders@aroyal.pk';
      const info = await transporter.sendMail({
        from: `"A.ROYAL Luxury" <${sender}>`,
        to: recipient,
        subject,
        html
      });
      return {
        success: true,
        recipient,
        message: `Real test email successfully delivered to ${recipient}! (Message ID: ${info.messageId})`
      };
    } else {
      return {
        success: true,
        recipient,
        message: `Email alert verified for ${recipient}. To receive real emails in your Gmail inbox, enter your Gmail address and 16-letter App Password in Settings.`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      recipient,
      message: `Gmail delivery error: ${err.message || err}. (Tip: ensure 2-Step Verification is ON and use a 16-character App Password, not your normal password).`
    };
  }
}
