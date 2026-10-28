const womenService = require('../services/women.service');

const getMyProfile = async (req, res, next) => {
  try {
    if (!req.user.womanId) {
      // Fallback: try finding woman by userId
      const profile = await womenService.getWomanByUserId(req.user.userId);
      return res.status(200).json({ success: true, data: profile });
    }
    const profile = await womenService.getWomanProfileById(req.user.womanId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const womanId = req.user.womanId || (await womenService.getWomanByUserId(req.user.userId)).woman_id;
    const { fullName, phone, educationLevel, address, bio } = req.body;
    const updated = await womenService.updateWomanProfile(womanId, {
      fullName,
      phone,
      educationLevel,
      address,
      bio,
    });
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

const getWomanById = async (req, res, next) => {
  try {
    const womanId = parseInt(req.params.id, 10);
    const profile = await womenService.getWomanProfileById(womanId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const listWomen = async (req, res, next) => {
  try {
    const { limit, offset, educationLevel, search } = req.query;
    const data = await womenService.getAllWomen({ limit, offset, educationLevel, search });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const addSkill = async (req, res, next) => {
  try {
    const womanId = req.user.womanId || (await womenService.getWomanByUserId(req.user.userId)).woman_id;
    const { skillId, proficiencyLevel, yearsExperience } = req.body;
    const skill = await womenService.addSkillToWoman(womanId, { skillId, proficiencyLevel, yearsExperience });
    res.status(201).json({ success: true, message: 'Skill added to profile.', data: skill });
  } catch (err) {
    next(err);
  }
};

const removeSkill = async (req, res, next) => {
  try {
    const womanId = req.user.womanId || (await womenService.getWomanByUserId(req.user.userId)).woman_id;
    const skillId = parseInt(req.params.skillId, 10);
    const result = await womenService.removeSkillFromWoman(womanId, skillId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getWomanById,
  listWomen,
  addSkill,
  removeSkill,
};
