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
        if (currentUser?.role === 'woman') {
          const res = await api.women.getMyProfile();
          if (res?.data) setProfileData(res.data);
        } else {
          const res = await api.auth.getMe();
          if (res?.data) setProfileData(res.data.profile || res.data);
        }
      } catch (err) {
        console.warn('Profile fetch fallback:', err);
        setProfileData({
          full_name: 'Priya Sharma',
          phone: '+91 98765 43210',
          education_level: 'Bachelor’s Degree',
          address: 'Bengaluru, Karnataka, India',
          bio: 'Passionate software engineer looking for full-stack frontend roles.',
          resume_url: '',
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
      if (user?.role === 'woman') {
        await api.women.updateMyProfile({
          fullName: formData.fullName,
          phone: formData.phone,
          educationLevel: formData.educationLevel,
          address: formData.address,
          bio: formData.bio,
          resumeUrl: formData.resumeUrl,
        });
      }
      setProfileData((prev) => ({ ...prev, ...formData }));
    } finally {
      setIsSaving(false);
    }
  };

  const role = user?.role || 'woman';

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
              {role === 'training_provider' ? 'Provider Account Profile' : role === 'admin' ? 'Administrator Profile' : 'Candidate Profile & Resume'}
            </h1>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {role === 'woman'
                ? 'Maintain your verified candidate identity, education credentials, resume link, and contact details for training and employment opportunities.'
                : 'Manage your authenticated account profile and contact records.'}
            </p>
          </div>

          {/* Profile Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/10">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary font-bold text-2xl flex items-center justify-center uppercase shadow-sm">
                {user?.email ? user.email.charAt(0) : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {profileData?.full_name || user?.email?.split('@')[0] || 'User Profile'}
                </h2>
                <p className="text-body-sm text-on-surface-variant">{user?.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary capitalize">
                  {role === 'training_provider' ? 'Training Provider' : role}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ProfileForm
                initialData={profileData || {}}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                role={role}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
