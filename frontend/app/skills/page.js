'use client';

import { useState, useEffect } from 'react';
import { api, getStoredUser } from '../../services/api';
import Sidebar from '../../components/Sidebar';

export default function SkillsPage() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [allSkillsCatalog, setAllSkillsCatalog] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New Skill Creation State (for Admin / Training Provider)
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Software Development');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    async function loadSkillsData() {
      setLoading(true);
      try {
        const [profileRes, catalogRes] = await Promise.allSettled([
          api.women.getMyProfile(),
          api.skills.getAll(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.data?.skills) {
          setCandidateSkills(profileRes.value.data.skills);
        }

        if (catalogRes.status === 'fulfilled' && catalogRes.value?.data?.length > 0) {
          setAllSkillsCatalog(catalogRes.value.data);
          setSelectedSkillId(catalogRes.value.data[0]?.skill_id || '');
        } else {
          const defaultCatalog = [
            { skill_id: 1, skill_name: 'Python Programming', category: 'Information Technology' },
            { skill_id: 2, skill_name: 'Web Development (React & Node.js)', category: 'Software Development' },
            { skill_id: 3, skill_name: 'Data Analysis with SQL & Excel', category: 'Data Science' },
            { skill_id: 4, skill_name: 'UI/UX Design with Figma', category: 'Creative & Design' },
            { skill_id: 5, skill_name: 'Digital Marketing & SEO', category: 'Business & Marketing' },
            { skill_id: 6, skill_name: 'Financial Accounting', category: 'Finance' },
          ];
          setAllSkillsCatalog(defaultCatalog);
          setSelectedSkillId('1');
        }
      } catch (err) {
        console.error('Error loading skills:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSkillsData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await api.women.addSkill({
        skillId: parseInt(selectedSkillId, 10),
        proficiencyLevel: proficiency,
      });

      const skillObj = allSkillsCatalog.find((s) => String(s.skill_id) === String(selectedSkillId));
      if (skillObj) {
        setCandidateSkills((prev) => [
          ...prev.filter((s) => String(s.skill_id) !== String(selectedSkillId)),
          { ...skillObj, proficiency_level: proficiency },
        ]);
      }
      setFeedback({ type: 'success', text: 'Skill added to your candidate profile!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not add skill.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.women.removeSkill(skillId);
      setCandidateSkills((prev) => prev.filter((s) => String(s.skill_id) !== String(skillId)));
      setFeedback({ type: 'success', text: 'Skill removed from profile.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to remove skill.' });
    }
  };

  const handleCreateTaxonomySkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsCreatingSkill(true);
    setFeedback(null);

    try {
      const res = await api.skills.create({
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDesc.trim() || undefined,
      });

      if (res.data) {
        setAllSkillsCatalog((prev) => [...prev, res.data]);
        setSelectedSkillId(res.data.skill_id);
      }
      setNewSkillName('');
      setNewSkillDesc('');
      setFeedback({ type: 'success', text: 'New skill registered into master taxonomy!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create skill.' });
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const isCandidate = !user || user.role === 'woman';
  const canManageTaxonomy = user?.role === 'admin' || user?.role === 'training_provider';

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
          <span className="font-headline-sm text-primary font-bold">Skills Portfolio</span>
        </div>

        <main className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="space-y-2">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              Technical Competencies
            </span>
            <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">
              Skills Taxonomy & Proficiency Records
            </h1>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Showcase technical expertise, map course learning outcomes, and maintain verified skill credentials.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {feedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="text-body-md">{feedback.text}</span>
            </div>
          )}

          {/* Section 1: Candidate Add Skill to Profile (Woman role) */}
          {isCandidate && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-5">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
                <span>Add Skill to My Profile</span>
              </h3>

              <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-6">
                  <label className="block text-label-md font-medium text-on-surface mb-1.5">Select Skill</label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary outline-none"
                  >
                    {allSkillsCatalog.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name} ({s.category || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-label-md font-medium text-on-surface mb-1.5">Proficiency Level</label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 focus:border-primary outline-none"
                  >
                    <option value="Beginner">Beginner (1-6 months)</option>
                    <option value="Intermediate">Intermediate (1-2 years)</option>
                    <option value="Advanced">Advanced (3+ years)</option>
                    <option value="Expert">Expert (Lead / Production)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-lg font-bold shadow-xs hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Candidate's Current Skills */}
          {isCandidate && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
                <h3 className="font-headline-sm font-bold text-on-surface">
                  My Active Skills Portfolio ({candidateSkills.length})
                </h3>
                <span className="text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified Profile Skills
                </span>
              </div>

              {candidateSkills.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant py-4">No skills added yet. Select a skill above to enrich your profile.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {candidateSkills.map((skill) => (
                    <div
                      key={skill.skill_id}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between hover:shadow-xs transition-shadow"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-label-lg font-bold text-on-surface truncate">
                          {skill.skill_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            {skill.category || 'Competency'}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] font-bold text-primary">
                            {skill.proficiency_level || 'Intermediate'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.skill_id)}
                        title="Remove Skill"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Master Skill Taxonomy (Admin & Training Provider authoring) */}
          {canManageTaxonomy && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-5">
              <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                <span>Register New Skill in Master Taxonomy</span>
              </h3>

              <form onSubmit={handleCreateTaxonomySkill} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-medium text-on-surface mb-1">Skill Name</label>
                    <input
                      type="text"
                      required
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Next.js App Router"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-medium text-on-surface mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      placeholder="e.g. Software Development"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                    placeholder="Brief description of skills, frameworks, and key topics"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface text-body-md border border-outline-variant/30 outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isCreatingSkill}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition disabled:opacity-50"
                  >
                    {isCreatingSkill ? 'Saving...' : 'Create Skill'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 4: Browse Full Master Catalog */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 space-y-4">
            <h3 className="font-headline-sm font-bold text-on-surface">
              Platform Skill Taxonomy ({allSkillsCatalog.length} Skills Available)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSkillsCatalog.map((s) => (
                <div key={s.skill_id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <div className="font-semibold text-on-surface text-sm">{s.skill_name}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">{s.category || 'General'}</div>
                  {s.description && (
                    <div className="text-[12px] text-on-surface-variant mt-1 line-clamp-1">{s.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
