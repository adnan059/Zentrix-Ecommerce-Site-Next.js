// src/lib/email/templates/welcome.ts
interface WelcomeEmailProps {
  name: string;
  email: string;
}

export function welcomeEmailHtml({ name }: WelcomeEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Zentrix</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#18181b;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Zentrix</h1>
              <p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;">Multi-Vendor Marketplace</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#18181b;font-size:22px;font-weight:600;">Welcome, ${name}! 🎉</h2>
              <p style="margin:0 0 20px;color:#52525b;font-size:15px;line-height:1.6;">
                Your Zentrix account is all set. Browse thousands of products from our verified vendors, save items to your wishlist, and checkout in seconds.
              </p>
              <p style="margin:0 0 32px;color:#52525b;font-size:15px;line-height:1.6;">Here's what you can do right away:</p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Browse featured products on the homepage</td></tr>
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Filter by category, brand, or price</td></tr>
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Save favourites to your Wishlist</td></tr>
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Become a vendor and start selling</td></tr>
              </table>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                Start Shopping →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f5;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">
                You received this email because you registered at Zentrix.<br />
                © ${new Date().getFullYear()} Zentrix. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailText({ name }: WelcomeEmailProps): string {
  return `Welcome to Zentrix, ${name}!

Your account is ready. Start browsing at ${process.env.NEXT_PUBLIC_APP_URL}

© ${new Date().getFullYear()} Zentrix`;
}
