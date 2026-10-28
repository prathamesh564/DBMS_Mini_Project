const skillsService = require('../services/skills.service');

const getAllSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const skills = await skillsService.getAllSkills({ category, search });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    next(err);
  }
};

const getSkillById = async (req, res, next) => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const skill = await skillsService.getSkillById(skillId);
    res.status(200).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { skillName, category, description } = req.body;
    const newSkill = await skillsService.createSkill({ skillName, category, description });
    res.status(201).json({ success: true, message: 'Skill created successfully.', data: newSkill });
  } catch (err) {
    next(err);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const { skillName, category, description } = req.body;
    const updated = await skillsService.updateSkill(skillId, { skillName, category, description });
    res.status(200).json({ success: true, message: 'Skill updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const result = await skillsService.deleteSkill(skillId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
