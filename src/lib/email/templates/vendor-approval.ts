// src/lib/email/templates/vendor-approval.ts
interface VendorApprovalProps {
  vendorName: string;
  storeName: string;
}

interface VendorRejectionProps {
  vendorName: string;
  storeName: string;
  reason?: string;
}

export function vendorApprovalHtml(props: VendorApprovalProps): string {
  const { vendorName, storeName } = props;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Vendor Application Was Approved</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#16a34a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:40px;">🎉</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Application Approved!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="margin:0 0 12px;color:#18181b;font-size:20px;font-weight:600;">Welcome aboard, ${vendorName}!</h2>
              <p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;">
                Your vendor application for <strong>${storeName}</strong> has been approved by the Zentrix admin team.
                Your store is now live and ready to accept orders.
              </p>
              <p style="margin:0 0 32px;color:#52525b;font-size:15px;line-height:1.6;">Here's what you can do now:</p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Add your products from the Vendor Dashboard</td></tr>
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Upload your store logo and banner</td></tr>
                <tr><td style="padding:8px 0;color:#18181b;font-size:14px;">✦ &nbsp;Track your orders and earnings in real time</td></tr>
              </table>
              <a href="${appUrl}/vendor/dashboard"
                style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                Go to Vendor Dashboard →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f5;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;margin-top:32px;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">© ${new Date().getFullYear()} Zentrix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function vendorApprovalText(props: VendorApprovalProps): string {
  const { vendorName, storeName } = props;
  return `Hi ${vendorName},

Your vendor application for "${storeName}" has been approved.

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard

© ${new Date().getFullYear()} Zentrix`;
}

export function vendorRejectionHtml(props: VendorRejectionProps): string {
  const { vendorName, storeName, reason } = props;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vendor Application Update</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#18181b;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Zentrix</h1>
              <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;">Application Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 0;">
              <h2 style="margin:0 0 12px;color:#18181b;font-size:20px;font-weight:600;">Hi ${vendorName},</h2>
              <p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;">
                Thank you for applying to become a vendor on Zentrix. After reviewing your application for
                <strong>${storeName}</strong>, we were unable to approve it at this time.
              </p>
              ${
                reason
                  ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px;">
                <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.5;"><strong>Reason:</strong> ${reason}</p>
              </div>`
                  : ""
              }
              <p style="margin:0 0 32px;color:#52525b;font-size:15px;line-height:1.6;">
                You're welcome to reapply after addressing the issue. If you believe this was a mistake,
                please contact our support team.
              </p>
              <a href="${appUrl}/vendor/register"
                style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                Reapply →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f5;padding:20px 40px;text-align:center;border-top:1px solid #e4e4e7;margin-top:32px;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">© ${new Date().getFullYear()} Zentrix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function vendorRejectionText(props: VendorRejectionProps): string {
  const { vendorName, storeName, reason } = props;
  return `Hi ${vendorName},

Your vendor application for "${storeName}" was not approved at this time.${reason ? `\n\nReason: ${reason}` : ""}

You may reapply at: ${process.env.NEXT_PUBLIC_APP_URL}/vendor/register

© ${new Date().getFullYear()} Zentrix`;
}
