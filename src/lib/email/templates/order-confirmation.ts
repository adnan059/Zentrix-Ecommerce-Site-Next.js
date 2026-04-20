// src/lib/email/templates/order-confirmation.ts
interface OrderItem {
  name: string;
  variantLabel: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

interface OrderConfirmationEmailProps {
  buyerName: string;
  orderId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: "aamarpay" | "cod";
}

function formatPrice(n: number): string {
  return `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

export function orderConfirmationHtml(
  props: OrderConfirmationEmailProps,
): string {
  const {
    buyerName,
    orderId,
    items,
    shippingAddress,
    subtotal,
    shippingFee,
    discount,
    total,
    paymentMethod,
  } = props;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e4e4e7;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="56">
              <img src="${item.image}" width="48" height="48"
                style="border-radius:6px;object-fit:cover;display:block;" alt="${item.name}" />
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0;color:#18181b;font-size:14px;font-weight:600;">${item.name}</p>
              <p style="margin:2px 0 0;color:#71717a;font-size:12px;">${item.variantLabel} × ${item.quantity}</p>
            </td>
            <td align="right" style="white-space:nowrap;">
              <p style="margin:0;color:#18181b;font-size:14px;font-weight:600;">${formatPrice(item.subtotal)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation #${orderId.slice(-8).toUpperCase()}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#18181b;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Zentrix</h1>
              <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;">Order Confirmed ✓</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 6px;color:#18181b;font-size:20px;font-weight:600;">Thank you, ${buyerName}!</h2>
              <p style="margin:0 0 4px;color:#52525b;font-size:14px;">Your order has been placed successfully.</p>
              <p style="margin:0 0 28px;color:#71717a;font-size:13px;">
                Order ID: <strong>#${orderId.slice(-8).toUpperCase()}</strong>
                &nbsp;·&nbsp; Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "AamarPay"}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:6px 0;color:#52525b;font-size:14px;">Subtotal</td>
                  <td align="right" style="padding:6px 0;color:#52525b;font-size:14px;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#52525b;font-size:14px;">Shipping</td>
                  <td align="right" style="padding:6px 0;color:#52525b;font-size:14px;">${shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</td>
                </tr>
                ${
                  discount > 0
                    ? `<tr>
                  <td style="padding:6px 0;color:#16a34a;font-size:14px;">Discount</td>
                  <td align="right" style="padding:6px 0;color:#16a34a;font-size:14px;">-${formatPrice(discount)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:12px 0 0;color:#18181b;font-size:16px;font-weight:700;border-top:2px solid #18181b;">Total</td>
                  <td align="right" style="padding:12px 0 0;color:#18181b;font-size:16px;font-weight:700;border-top:2px solid #18181b;">${formatPrice(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 10px;color:#18181b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Shipping To</h3>
              <p style="margin:0;color:#52525b;font-size:14px;line-height:1.7;">
                ${shippingAddress.fullName}<br />
                ${shippingAddress.phone}<br />
                ${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}<br />
                ${shippingAddress.city}, ${shippingAddress.district}${shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <a href="${appUrl}/orders/${orderId}"
                style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                Track Your Order →
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

export function orderConfirmationText(
  props: OrderConfirmationEmailProps,
): string {
  const { buyerName, orderId, total, paymentMethod } = props;
  return `Hi ${buyerName},

Your Zentrix order #${orderId.slice(-8).toUpperCase()} has been confirmed.
Total: ৳${total.toFixed(2)} — ${paymentMethod === "cod" ? "Cash on Delivery" : "AamarPay"}

Track your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}

© ${new Date().getFullYear()} Zentrix`;
}
