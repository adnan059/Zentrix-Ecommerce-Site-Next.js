import { toggleWishlistAction } from "@/lib/actions/wishlist.actions";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface IWishlistButtonProps {
  productId: string;
  initialInWishlist: boolean;
  isLoggedIn: boolean;
  className?: string;
}

const WishlistButton = ({
  productId,
  initialInWishlist,
  isLoggedIn,
  className,
}: IWishlistButtonProps) => {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);

  const router = useRouter();

  const { execute, isPending } = useAction(toggleWishlistAction, {
    onSuccess: ({ data }) => {
      setInWishlist(data?.added ?? false);
      toast.success(
        data?.added ? "Added to wishlist!" : "Removed from wishlist",
      );
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong");
    },
  });

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    execute({ productId });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "p-2 rounded-full transition-colors",
        inWishlist
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-400 hover:text-red-400 hover:bg-gray-100",
        className,
      )}
    >
      <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
    </button>
  );
};

export default WishlistButton;
