import { z } from "zod";

export const vendorRegisterSchema = z.object({
  storeName: z.string().min(2, "Store name too short").max(80),
  description: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
});

export const vendorSettingsSchema = z.object({
  storeName: z.string().min(2).max(80),
  description: z.string().max(1000).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
});

export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;

export type VendorSettingsInput = z.infer<typeof vendorSettingsSchema>;
