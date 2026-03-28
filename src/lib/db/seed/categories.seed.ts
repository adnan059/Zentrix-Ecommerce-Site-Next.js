// src/lib/db/seed/categories.seed.ts
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/category.model";

const categories = [
  {
    name: "Processor",
    slug: "processor",
    sortOrder: 1,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Processor",
    specSchema: [
      {
        key: "socket",
        label: "Socket",
        type: "select",
        options: ["AM5", "AM4", "LGA1851", "LGA1700"],
        filterable: true,
      },
      { key: "cores", label: "Cores", type: "number", filterable: true },
      { key: "threads", label: "Threads", type: "number", filterable: false },
      {
        key: "baseClock",
        label: "Base Clock",
        type: "text",
        unit: "GHz",
        filterable: false,
      },
      {
        key: "boostClock",
        label: "Boost Clock",
        type: "text",
        unit: "GHz",
        filterable: false,
      },
      {
        key: "tdp",
        label: "TDP",
        type: "number",
        unit: "W",
        filterable: false,
      },
    ],
  },
  {
    name: "Motherboard",
    slug: "motherboard",
    sortOrder: 2,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Motherboard",
    specSchema: [
      {
        key: "socket",
        label: "Socket",
        type: "select",
        options: ["AM5", "AM4", "LGA1851", "LGA1700"],
        filterable: true,
      },
      {
        key: "formFactor",
        label: "Form Factor",
        type: "select",
        options: ["ATX", "Micro-ATX", "Mini-ITX"],
        filterable: true,
      },
      { key: "chipset", label: "Chipset", type: "text", filterable: false },
      {
        key: "memorySlots",
        label: "Memory Slots",
        type: "number",
        filterable: false,
      },
      {
        key: "maxMemory",
        label: "Max Memory",
        type: "text",
        unit: "GB",
        filterable: false,
      },
    ],
  },
  {
    name: "RAM",
    slug: "ram",
    sortOrder: 3,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=RAM",
    specSchema: [
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["DDR5", "DDR4", "DDR3"],
        filterable: true,
      },
      {
        key: "capacity",
        label: "Capacity",
        type: "select",
        options: ["8GB", "16GB", "32GB", "64GB"],
        filterable: true,
      },
      {
        key: "speed",
        label: "Speed",
        type: "text",
        unit: "MHz",
        filterable: false,
      },
      { key: "cas", label: "CAS Latency", type: "text", filterable: false },
    ],
  },
  {
    name: "Storage",
    slug: "storage",
    sortOrder: 4,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Storage",
    specSchema: [
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["NVMe SSD", "SATA SSD", "HDD"],
        filterable: true,
      },
      {
        key: "capacity",
        label: "Capacity",
        type: "select",
        options: ["256GB", "512GB", "1TB", "2TB", "4TB"],
        filterable: true,
      },
      {
        key: "interface",
        label: "Interface",
        type: "select",
        options: ["PCIe 5.0", "PCIe 4.0", "PCIe 3.0", "SATA III"],
        filterable: true,
      },
      {
        key: "readSpeed",
        label: "Read Speed",
        type: "text",
        unit: "MB/s",
        filterable: false,
      },
    ],
  },
  {
    name: "Power Supply",
    slug: "power-supply",
    sortOrder: 5,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=PSU",
    specSchema: [
      {
        key: "wattage",
        label: "Wattage",
        type: "select",
        options: ["450W", "550W", "650W", "750W", "850W", "1000W+"],
        filterable: true,
      },
      {
        key: "efficiency",
        label: "Efficiency",
        type: "select",
        options: ["80+ Bronze", "80+ Gold", "80+ Platinum", "80+ Titanium"],
        filterable: true,
      },
      {
        key: "modular",
        label: "Modular",
        type: "select",
        options: ["Full", "Semi", "Non-modular"],
        filterable: true,
      },
    ],
  },
  {
    name: "Casing",
    slug: "casing",
    sortOrder: 6,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Casing",
    specSchema: [
      {
        key: "formFactor",
        label: "Form Factor",
        type: "select",
        options: ["Full Tower", "Mid Tower", "Mini Tower", "Mini-ITX"],
        filterable: true,
      },
      {
        key: "sidePanel",
        label: "Side Panel",
        type: "select",
        options: ["Tempered Glass", "Steel", "Acrylic"],
        filterable: true,
      },
      {
        key: "fanSupport",
        label: "Max Fan Support",
        type: "text",
        filterable: false,
      },
    ],
  },
  {
    name: "Monitor",
    slug: "monitor",
    sortOrder: 7,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Monitor",
    specSchema: [
      {
        key: "size",
        label: "Screen Size",
        type: "select",
        options: ['24"', '27"', '32"', '34"', '49"'],
        filterable: true,
      },
      {
        key: "resolution",
        label: "Resolution",
        type: "select",
        options: ["1080p", "1440p", "4K", "Ultrawide"],
        filterable: true,
      },
      {
        key: "refreshRate",
        label: "Refresh Rate",
        type: "select",
        options: ["60Hz", "75Hz", "144Hz", "165Hz", "240Hz"],
        filterable: true,
      },
      {
        key: "panel",
        label: "Panel Type",
        type: "select",
        options: ["IPS", "VA", "TN", "OLED"],
        filterable: true,
      },
    ],
  },
  {
    name: "Keyboard",
    slug: "keyboard",
    sortOrder: 8,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Keyboard",
    specSchema: [
      {
        key: "type",
        label: "Type",
        type: "select",
        options: ["Mechanical", "Membrane", "Optical"],
        filterable: true,
      },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: ["Full Size", "TKL", "75%", "65%", "60%"],
        filterable: true,
      },
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        options: ["USB", "Wireless", "Bluetooth", "2.4GHz"],
        filterable: true,
      },
      { key: "switchType", label: "Switch", type: "text", filterable: false },
    ],
  },
  {
    name: "Mouse",
    slug: "mouse",
    sortOrder: 9,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Mouse",
    specSchema: [
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        options: ["Wired", "Wireless", "Bluetooth"],
        filterable: true,
      },
      { key: "dpi", label: "Max DPI", type: "text", filterable: false },
      { key: "buttons", label: "Buttons", type: "number", filterable: false },
      {
        key: "weight",
        label: "Weight",
        type: "text",
        unit: "g",
        filterable: false,
      },
    ],
  },
  {
    name: "Casing Fan",
    slug: "casing-fan",
    sortOrder: 10,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=Fan",
    specSchema: [
      {
        key: "size",
        label: "Size",
        type: "select",
        options: ["80mm", "92mm", "120mm", "140mm", "200mm"],
        filterable: true,
      },
      {
        key: "rpm",
        label: "Max RPM",
        type: "text",
        unit: "RPM",
        filterable: false,
      },
      {
        key: "rgb",
        label: "RGB",
        type: "select",
        options: ["Yes", "No", "ARGB"],
        filterable: true,
      },
      { key: "bearing", label: "Bearing", type: "text", filterable: false },
    ],
  },
  {
    name: "UPS",
    slug: "ups",
    sortOrder: 11,
    image: "https://dummyimage.com/400x400/e2e8f0/475569&text=UPS",
    specSchema: [
      {
        key: "capacity",
        label: "Capacity",
        type: "select",
        options: ["600VA", "800VA", "1000VA", "1200VA", "1500VA+"],
        filterable: true,
      },
      { key: "outlets", label: "Outlets", type: "number", filterable: false },
      {
        key: "backupTime",
        label: "Backup Time",
        type: "text",
        unit: "min",
        filterable: false,
      },
    ],
  },
];

export async function seedCategories() {
  await connectDB();
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.warn("✅ Categories seeded successfully");
}
