"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase";
import { User, Mail, Calendar, CreditCard, Shield, Edit, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GuaiLoader from "@/components/shared/guai-loader";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  current_credit: number;
  plan_type: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <GuaiLoader size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Không tìm thấy thông tin người dùng.</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const planLabels: Record<string, string> = {
    free: 'Miễn phí',
    pro: 'Pro',
    business: 'Business',
  };

  const roleLabels: Record<string, string> = {
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    admin: 'Quản trị viên',
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-tight mb-2">
          Hồ sơ <span className="font-normal italic text-primary">cá nhân</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản và cài đặt của bạn
        </p>
      </div>

      {/* Profile Card */}
      <div className="space-y-6">
        {/* Avatar & Basic Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-rose-500/20 flex items-center justify-center overflow-hidden border-2 border-border">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || 'Avatar'}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-primary">
                    {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Camera className="size-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">
                    {profile.name || 'Chưa đặt tên'}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4" />
                    {profile.email}
                  </p>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="size-4" />
                    Chỉnh sửa
                  </Button>
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="size-4 text-primary" />
                  <span className="font-medium">{roleLabels[profile.role] || profile.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Tham gia {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Thông tin tài khoản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Gói dịch vụ</p>
              <p className="font-medium">{planLabels[profile.plan_type] || profile.plan_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Credit hiện có</p>
              <p className="font-medium flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                {profile.current_credit.toLocaleString()} credits
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Trạng thái</p>
              <p className={`font-medium ${profile.status === 'active' ? 'text-emerald-500' : 'text-destructive'}`}>
                {profile.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cập nhật lần cuối</p>
              <p className="font-medium">{formatDate(profile.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Hành động nhanh</h3>
          <div className="space-y-3">
            <Link href="/profile/edit" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Edit className="size-4" />
                Chỉnh sửa hồ sơ
              </Button>
            </Link>
            <Link href="/profile/password" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="size-4" />
                Đổi mật khẩu
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
