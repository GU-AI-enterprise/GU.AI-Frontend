"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

import { createClient } from "@/lib/supabase";
import { User, Mail, Camera, ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GuaiLoader from "@/components/shared/guai-loader";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export default function EditProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setName(data.name || "");
      setAvatarUrl(data.avatar_url || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({
          name: name || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <GuaiLoader size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="size-4" />
          Quay lại hồ sơ
        </Link>
        <h1 className="font-serif text-3xl font-light tracking-tight mb-2">
          Chỉnh sửa <span className="font-normal italic text-primary">hồ sơ</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-500">
          Cập nhật hồ sơ thành công! Đang chuyển hướng...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Ảnh đại diện</h3>
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-rose-500/20 flex items-center justify-center overflow-hidden border-2 border-border">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-primary">
                  {name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  URL ảnh đại diện
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nhập URL của ảnh bạn muốn sử dụng làm ảnh đại diện
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>
          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 py-2.5 px-4 text-sm text-muted-foreground">
                <Mail className="size-4" />
                {profile?.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Email không thể thay đổi
              </p>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 gap-2"
          >
            {saving ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="gap-2"
          >
            <X className="size-4" />
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
