import { ProductStatus } from "@/types";

const statusStyles: Record<ProductStatus, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function ProductStatusBadge({
  status,
}: {
  status: ProductStatus;
}) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
