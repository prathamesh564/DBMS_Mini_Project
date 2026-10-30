'use client';

import { useState } from 'react';

export default function ProfileForm({ initialData = {}, onSave, isSaving = false, role = 'woman' }) {
  const [formData, setFormData] = useState({
    fullName: initialData.full_name || initialData.fullName || '',
    phone: initialData.phone || '',
    educationLevel: initialData.education_level || initialData.educationLevel || 'Bachelor’s Degree',
    address: initialData.address || '',
    companyName: initialData.company_name || initialData.companyName || '',
    industry: initialData.industry || '',
    providerName: initialData.provider_name || initialData.providerName || '',
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

      {/* Role-specific fields */}
      {role === 'woman' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
                Full Name
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
                Highest Education Level
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
              >
                <option value="High School">High School</option>
                <option value="Diploma">Diploma / Vocational Cert</option>
                <option value="Bachelor’s Degree">Bachelor’s Degree</option>
                <option value="Master’s Degree">Master’s Degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Self-Taught">Self-Taught / Career Switcher</option>
              </select>
            </div>

            <div>
              <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
                Residential Location / City
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-[20px] pointer-events-none">
                  location_on
                </span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {role === 'employer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="e.g. Acme Tech Corporation"
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Industry Focus
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g. Software, Cloud Services, FinTech"
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
        </div>
      )}

      {role === 'training_provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Institution / Academy Name
            </label>
            <input
              type="text"
              name="providerName"
              value={formData.providerName}
              onChange={handleChange}
              required
              placeholder="e.g. TechForAll Institute"
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
          <div>
            <label className="block text-label-md font-label-md font-medium text-on-surface mb-1.5">
              Contact Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest outline-none transition"
            />
          </div>
        </div>
      )}

      <div className="pt-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container shadow-sm transition-all font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              Saving Changes...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Profile Details
            </>
          )}
        </button>
      </div>
    </form>
  );
}
