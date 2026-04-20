// src/lib/email/templates/vendor-order-notification.ts
interface VendorOrderItem {
  name: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface VendorOrderNotificationProps {
  vendorName: string;
  storeName: string;
  orderId: string;
  items: VendorOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  total: number;
  paymentMethod: "aamarpay" | "cod";
  paymentStatus: "paid" | "unpaid";
}

function formatPrice(n: number): string {
  return `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

export function vendorOrderNotificationHtml(
  props: VendorOrderNotificationProps,
): string {
  const {
    vendorName,
    storeName,
    orderId,
    items,
    shippingAddress,
    total,
    paymentMethod,
    paymentStatus,
  } = props;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;">
        <p style="margin:0;color:#18181b;font-size:14px;font-weight:600;">${item.name}</p>
        <p style="margin:2px 0 0;color:#71717a;font-size:12px;">
          Variant: ${item.variantLabel} &nbsp;·&nbsp; SKU: ${item.sku} &nbsp;·&nbsp; Qty: ${item.quantity}
        </p>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #e4e4e7;white-space:nowrap;">
        <p style="margin:0;color:#18181b;font-size:14px;font-weight:600;">${formatPrice(item.subtotal)}</p>
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order — #${orderId.slice(-8).toUpperCase()}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#18181b;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Zentrix</h1>
              <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;">New Order Received 🛍️</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 6px;color:#18181b;font-size:20px;font-weight:600;">Hi ${vendorName},</h2>
              <p style="margin:0 0 4px;color:#52525b;font-size:14px;">
                Your store <strong>${storeName}</strong> has received a new order.
              </p>
              <p style="margin:0 0 28px;color:#71717a;font-size:13px;">
                Order ID: <strong>#${orderId.slice(-8).toUpperCase()}</strong>
                &nbsp;·&nbsp; Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "AamarPay"}
                &nbsp;·&nbsp; Status:
                <span style="color:${paymentStatus === "paid" ? "#16a34a" : "#d97706"};font-weight:600;">
                  ${paymentStatus === "paid" ? "Paid ✓" : "Pending Payment"}
                </span>
              </p>
              <h3 style="margin:0 0 8px;color:#18181b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:10px 0;color:#18181b;font-size:15px;font-weight:700;border-top:2px solid #18181b;">Your Revenue</td>
                  <td align="right" style="padding:10px 0;color:#18181b;font-size:15px;font-weight:700;border-top:2px solid #18181b;">${formatPrice(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 10px;color:#18181b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ship To</h3>
              <p style="margin:0;color:#52525b;font-size:14px;line-height:1.7;">
                ${shippingAddress.fullName} &nbsp;·&nbsp; ${shippingAddress.phone}<br />
                ${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}<br />
                ${shippingAddress.city}, ${shippingAddress.district}${shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <a href="${appUrl}/vendor/orders/${orderId}"
                style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                Manage This Order →
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

export function vendorOrderNotificationText(
  props: VendorOrderNotificationProps,
): string {
  const { vendorName, storeName, orderId, total } = props;
  return `Hi ${vendorName},

Your store "${storeName}" has a new order: #${orderId.slice(-8).toUpperCase()}
Revenue: ৳${total.toFixed(2)}

Manage it: ${process.env.NEXT_PUBLIC_APP_URL}/vendor/orders/${orderId}

© ${new Date().getFullYear()} Zentrix`;
}
