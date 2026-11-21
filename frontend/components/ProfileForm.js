'use client';

import { useState } from 'react';

export default function ProfileForm({ initialData = {}, onSave, isSaving = false, role = 'woman' }) {
  const [formData, setFormData] = useState({
    fullName: initialData.full_name || initialData.fullName || '',
    phone: initialData.phone || '',
    educationLevel: initialData.education_level || initialData.educationLevel || 'Bachelor’s Degree',
    address: initialData.address || '',
    bio: initialData.bio || '',
    resumeUrl: initialData.resume_url || initialData.resumeUrl || '',
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (onSave) {
        await onSave(formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-body-md font-body-md">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
            Full Name / Contact Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
              badge
            </span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="e.g. Priya Sharma"
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
              call
            </span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
        </div>
      </div>

      {role === 'woman' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Highest Education Level
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
                school
              </span>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
              >
                <option value="High School">High School / 12th</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="Bachelor’s Degree">Bachelor’s Degree (B.E / B.Tech / B.Sc / B.Com)</option>
                <option value="Master’s Degree">Master’s Degree (M.E / M.Tech / M.Sc / MCA)</option>
                <option value="Doctorate">Doctorate / Ph.D.</option>
                <option value="Other">Self-taught / Other Certification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Resume URL / Portfolio Link
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
                link
              </span>
              <input
                type="url"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/your-resume or portfolio link"
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
          Residential Address / City, State
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-secondary text-[20px] pointer-events-none">
            location_on
          </span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Bengaluru, Karnataka, India"
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
          />
        </div>
      </div>

      {role === 'woman' && (
        <div>
          <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
            Professional Bio & Goals
          </label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Brief statement about your career aspirations, key areas of technical interest, and availability..."
            className="w-full p-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
          />
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg font-bold shadow-xs hover:bg-primary transition flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
