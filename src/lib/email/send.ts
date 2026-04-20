"use server";
// src/lib/email/send.ts
import { resend, FROM_EMAIL } from "./resend";
import {
  orderConfirmationHtml,
  orderConfirmationText,
} from "./templates/order-confirmation";
import {
  vendorApprovalHtml,
  vendorApprovalText,
  vendorRejectionHtml,
  vendorRejectionText,
} from "./templates/vendor-approval";
import {
  vendorOrderNotificationHtml,
  vendorOrderNotificationText,
} from "./templates/vendor-order-notification";
import { welcomeEmailHtml, welcomeEmailText } from "./templates/welcome";

/* ─── Welcome email ──────────────────────────────────────────────────────── */

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
}): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: "Welcome to Zentrix 🎉",
      html: welcomeEmailHtml({ name: opts.name, email: opts.to }),
      text: welcomeEmailText({ name: opts.name, email: opts.to }),
    });
  } catch (err) {
    // Email failures must never crash the main flow — log and continue
    console.error("[email] sendWelcomeEmail failed:", err);
  }
}

/* ─── Order confirmation (buyer) ─────────────────────────────────────────── */

interface OrderEmailPayload {
  to: string;
  buyerName: string;
  orderId: string;
  items: Array<{
    name: string;
    variantLabel: string;
    quantity: number;
    price: number;
    subtotal: number;
    image: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: "aamarpay" | "cod";
}

export async function sendOrderConfirmationEmail(
  opts: OrderEmailPayload,
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Order Confirmed — #${opts.orderId.slice(-8).toUpperCase()} | Zentrix`,
      html: orderConfirmationHtml(opts),
      text: orderConfirmationText(opts),
    });
  } catch (err) {
    console.error("[email] sendOrderConfirmationEmail failed:", err);
  }
}

/* ─── Order notification (vendor) ───────────────────────────────────────── */

interface VendorNotificationPayload {
  to: string;
  vendorName: string;
  storeName: string;
  orderId: string;
  items: Array<{
    name: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
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

export async function sendVendorOrderNotificationEmail(
  opts: VendorNotificationPayload,
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `New Order #${opts.orderId.slice(-8).toUpperCase()} — ${opts.storeName}`,
      html: vendorOrderNotificationHtml(opts),
      text: vendorOrderNotificationText(opts),
    });
  } catch (err) {
    console.error("[email] sendVendorOrderNotificationEmail failed:", err);
  }
}

/* ─── Vendor approval ───────────────────────────────────────────────────── */

export async function sendVendorApprovalEmail(opts: {
  to: string;
  vendorName: string;
  storeName: string;
}): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Your Zentrix Vendor Application Was Approved 🎉`,
      html: vendorApprovalHtml({
        vendorName: opts.vendorName,
        storeName: opts.storeName,
      }),
      text: vendorApprovalText({
        vendorName: opts.vendorName,
        storeName: opts.storeName,
      }),
    });
  } catch (err) {
    console.error("[email] sendVendorApprovalEmail failed:", err);
  }
}

/* ─── Vendor rejection ──────────────────────────────────────────────────── */

export async function sendVendorRejectionEmail(opts: {
  to: string;
  vendorName: string;
  storeName: string;
  reason?: string;
}): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `Update on Your Zentrix Vendor Application`,
      html: vendorRejectionHtml({
        vendorName: opts.vendorName,
        storeName: opts.storeName,
        reason: opts.reason,
      }),
      text: vendorRejectionText({
        vendorName: opts.vendorName,
        storeName: opts.storeName,
        reason: opts.reason,
      }),
    });
  } catch (err) {
    console.error("[email] sendVendorRejectionEmail failed:", err);
  }
}
