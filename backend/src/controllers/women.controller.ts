import { Request, Response, NextFunction } from 'express';
import * as womenService from '../services/women.service';

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!req.user.womanId) {
      // Fallback: try finding woman by userId
      const profile = await womenService.getWomanByUserId(req.user.userId);
      res.status(200).json({ success: true, data: profile });
      return;
    }
    const profile = await womenService.getWomanProfileById(req.user.womanId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
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

export const getWomanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const womanId = parseInt(req.params.id, 10);
    const profile = await womenService.getWomanProfileById(womanId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const listWomen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit, offset, educationLevel, search } = req.query;
    const data = await womenService.getAllWomen({
      limit: limit as string,
      offset: offset as string,
      educationLevel: educationLevel as string,
      search: search as string,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const addSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const womanId = req.user.womanId || (await womenService.getWomanByUserId(req.user.userId)).woman_id;
    const { skillId, proficiencyLevel, yearsExperience } = req.body;
    const skill = await womenService.addSkillToWoman(womanId, { skillId, proficiencyLevel, yearsExperience });
    res.status(201).json({ success: true, message: 'Skill added to profile.', data: skill });
  } catch (err) {
    next(err);
  }
};

export const removeSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const womanId = req.user.womanId || (await womenService.getWomanByUserId(req.user.userId)).woman_id;
    const skillId = parseInt(req.params.skillId, 10);
    const result = await womenService.removeSkillFromWoman(womanId, skillId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
