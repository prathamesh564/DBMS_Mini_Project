'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import ProfileForm from '../../components/ProfileForm';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    async function fetchProfile() {
      setLoading(true);
      try {
        if (currentUser?.role === 'employer') {
          const res = await api.employers.getMyProfile();
          if (res?.data) setProfileData(res.data);
        } else {
          // Default to candidate woman profile
          const res = await api.women.getMyProfile();
          if (res?.data) setProfileData(res.data);
        }
      } catch (err) {
        console.warn('Profile fetch fallback to local defaults:', err);
        setProfileData({
          full_name: 'Priya Sharma',
          phone: '+91 98765 43210',
          education_level: 'Bachelor’s in Computer Science',
          address: 'Bengaluru, Karnataka, India',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSaveProfile = async (formData) => {
    setIsSaving(true);
    try {
      if (user?.role === 'employer') {
        await api.employers.updateMyProfile({
          companyName: formData.companyName,
          industry: formData.industry,
          phone: formData.phone,
          address: formData.address,
        });
      } else {
        await api.women.updateMyProfile({
          fullName: formData.fullName,
          phone: formData.phone,
          educationLevel: formData.educationLevel,
          address: formData.address,
        });
      }
      setProfileData((prev) => ({ ...prev, ...formData }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-outline-variant/15">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
            <span className="font-label-md font-bold text-on-surface">Menu</span>
          </button>
          <span className="font-headline-sm text-primary font-bold">Profile Management</span>
        </div>

        <main className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              Account Credentials & Persona
            </span>
            <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">
              Personal Profile & Records
            </h1>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Maintain your official candidate identity for recruiter verification, skill certification badges, and direct hiring workflows.
            </p>
          </div>

          {/* Profile Card */}
          <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-outline-variant/15">
              <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary font-bold text-2xl flex items-center justify-center shadow-xs uppercase">
                {profileData?.full_name ? profileData.full_name.charAt(0) : user?.email?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="font-headline-sm font-bold text-on-surface">
                  {profileData?.full_name || 'Priya Sharma'}
                </h3>
                <p className="text-body-sm text-on-surface-variant">{user?.email || 'priya.sharma@empowerher.org'}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold capitalize">
                  {user?.role || 'Candidate'}
                </span>
              </div>
            </div>

            <ProfileForm
              initialData={profileData || {}}
              onSave={handleSaveProfile}
              isSaving={isSaving}
              role={user?.role || 'woman'}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
