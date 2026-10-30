import { Request, Response, NextFunction } from 'express';
import * as employersService from '../services/employers.service';

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    let employerId = req.user.employerId;
    if (!employerId) {
      const emp = await employersService.getEmployerByUserId(req.user.userId);
      return res.status(200).json({ success: true, data: emp });
    }
    const profile = await employersService.getEmployerById(employerId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    let employerId = req.user.employerId;
    if (!employerId) {
      const emp = await employersService.getEmployerByUserId(req.user.userId);
      employerId = emp?.employer_id;
    }
    if (!employerId) {
      return res.status(400).json({ success: false, message: 'Employer profile not found for this user.' });
    }
    const { companyName, industry, phone, address, website } = req.body;
    const updated = await employersService.updateEmployer(employerId, { companyName, industry, phone, address, website });
    res.status(200).json({ success: true, message: 'Employer profile updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const createEmployer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { companyName, industry, email, phone, address, website } = req.body;
    const newEmp = await employersService.createEmployer({
      userId: req.user ? req.user.userId : null,
      companyName,
      industry,
      email: email || req.user?.email,
      phone,
      address,
      website,
    });
    res.status(201).json({ success: true, message: 'Employer profile created.', data: newEmp });
  } catch (err) {
    next(err);
  }
};

export const getEmployerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employerId = parseInt(req.params.id, 10);
    const employer = await employersService.getEmployerById(employerId);
    res.status(200).json({ success: true, data: employer });
  } catch (err) {
    next(err);
  }
};

export const listEmployers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { industry, search, limit, offset } = req.query;
    const result = await employersService.getAllEmployers({
      industry: industry as string,
      search: search as string,
      limit: limit as string,
      offset: offset as string,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
