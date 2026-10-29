import { Request, Response, NextFunction } from 'express';
import * as skillsService from '../services/skills.service';

export const getAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search } = req.query;
    const skills = await skillsService.getAllSkills({
      category: category as string,
      search: search as string,
    });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    next(err);
  }
};

export const getSkillById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const skill = await skillsService.getSkillById(skillId);
    res.status(200).json({ success: true, data: skill });
  } catch (err) {
    next(err);
  }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skillName, category, description } = req.body;
    const newSkill = await skillsService.createSkill({ skillName, category, description });
    res.status(201).json({ success: true, message: 'Skill created successfully.', data: newSkill });
  } catch (err) {
    next(err);
  }
};

export const updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const { skillName, category, description } = req.body;
    const updated = await skillsService.updateSkill(skillId, { skillName, category, description });
    res.status(200).json({ success: true, message: 'Skill updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillId = parseInt(req.params.id, 10);
    const result = await skillsService.deleteSkill(skillId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
