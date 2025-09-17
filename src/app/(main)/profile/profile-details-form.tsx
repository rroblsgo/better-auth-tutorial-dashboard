'use client';

import { LoadingButton } from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/user-avatar';
import { User } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  image: z.string().optional().nullable(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

interface ProfileDetailsFormProps {
  user: User;
}

// Cloudinary upload function
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );
  formData.append('folder', 'better-auth'); // Optional: organize uploads in folders

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

export function ProfileDetailsForm({ user }: ProfileDetailsFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name ?? '',
      image: user.image ?? null,
    },
  });

  async function onSubmit({ name, image }: UpdateProfileValues) {
    setStatus(null);
    setError(null);
    const { error } = await authClient.updateUser({ name, image });
    if (error) {
      setError(error.message || 'Failed to update profile');
    } else {
      setStatus('Profile updated successfully');
      router.refresh();
    }
  }

  // function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64 = reader.result as string;
  //       form.setValue('image', base64, { shouldDirty: true });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Update form with the Cloudinary URL
      form.setValue('image', cloudinaryUrl, { shouldDirty: true });
      setStatus('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const imagePreview = form.watch('image');
  const loading = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Profile image</FormLabel>
                  <FormControl>
                    {/* <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                    /> */}
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Upload className="size-4 animate-pulse text-blue-600" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview && (
              <div className="relative size-16">
                <UserAvatar
                  name={user.name}
                  image={imagePreview}
                  className="size-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute -top-2 -right-2 size-6 rounded-full"
                  // onClick={() => form.setValue('image', null)}
                  onClick={() => {
                    form.setValue('image', null, { shouldDirty: true });
                    setStatus(null);
                  }}
                  aria-label="Remove image"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            )}

            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}
            {status && (
              <div role="status" className="text-sm text-green-600">
                {status}
              </div>
            )}
            <LoadingButton type="submit" loading={loading}>
              Save changes
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
