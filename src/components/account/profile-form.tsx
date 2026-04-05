"use client";

import { updateProfileAction } from "@/lib/actions/profile.actions";
import {
  UpdateProfileInput,
  updateProfileSchema,
} from "@/lib/validations/profile.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface IProfileFormProps {
  defaultValues: UpdateProfileInput;
}

const ProfileForm = ({ defaultValues }: IProfileFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  const { execute, isPending } = useAction(updateProfileAction, {
    onSuccess: () => toast.success("Profile updated successfully"),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Failed to update profile"),
  });
  return (
    <form onSubmit={handleSubmit(execute)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="image">Avatar URL</Label>
        <Input
          id="image"
          type="url"
          placeholder="https://..."
          {...register("image")}
        />
        {errors.image && (
          <p className="text-xs text-red-500">{errors.image.message}</p>
        )}
        <p className="text-xs text-gray-400">
          Paste a direct image URL (e.g. from Gravatar or Imgur)
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};

export default ProfileForm;
