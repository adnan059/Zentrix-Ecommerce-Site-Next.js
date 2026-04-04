import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/product.model";
import { Vendor } from "@/lib/db/models/vendor.model";
import { Types } from "mongoose";

export async function seedVendorAndProduct() {
  await connectDB();

  // Delete old bad data
  await Vendor.deleteMany({});
  await Product.deleteMany({});

  // Create a real vendor
  const vendor = await Vendor.create({
    userId: new Types.ObjectId(), // dummy user ref, replace with real userId if you have one
    storeName: "Zentrix Official Store",
    storeSlug: "zentrix-official",
    description: "Official demo vendor store",
    status: "approved",
    rating: 4.5,
    totalReviews: 0,
    totalSales: 0,
    email: "zentrix@vendor.com",
  });

  console.log("✅ Vendor created:", vendor._id.toString());

  // Create product with real vendorId and variant _id
  const product = await Product.create({
    vendorId: vendor._id,
    categoryId: new Types.ObjectId("69c589085685030910e6498c"), // your real category _id
    name: "AMD Ryzen 5 7600X Processor",
    slug: "amd-ryzen-5-7600x",
    description:
      "The AMD Ryzen 5 7600X is a high-performance desktop processor built on the Zen 4 architecture.",
    brand: "AMD",
    images: ["https://dummyimage.com/600x600/e2e8f0/475569&text=Ryzen+5+7600X"],
    variants: [
      {
        label: "Ryzen 5 7600X",
        sku: "AMD-R5-7600X",
        price: 28500,
        compareAtPrice: 32000,
        stock: 15,
        specs: {
          socket: "AM5",
          cores: "6",
          threads: "12",
          baseClock: "4.7 GHz",
          boostClock: "5.3 GHz",
        },
      },
    ],
    basePrice: 28500,
    status: "published",
    isFeatured: true,
    rating: 4.5,
    totalReviews: 12,
    totalSales: 8,
    tags: ["processor", "AMD", "Ryzen", "AM5", "desktop"],
    warranty: "3 years",
  });

  console.log("✅ Product created:", product._id.toString());
  console.log("✅ Variant _id:", product.variants[0]._id.toString());
}
