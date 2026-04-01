import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z
    .string()
    .regex(/^(\+88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["aamarpay", "cod"]),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
