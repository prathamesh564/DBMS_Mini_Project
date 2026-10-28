const employersService = require('../services/employers.service');

const getMyProfile = async (req, res, next) => {
  try {
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

const updateMyProfile = async (req, res, next) => {
  try {
    let employerId = req.user.employerId;
    if (!employerId) {
      const emp = await employersService.getEmployerByUserId(req.user.userId);
      employerId = emp.employer_id;
    }
    const { companyName, industry, phone, address, website } = req.body;
    const updated = await employersService.updateEmployer(employerId, { companyName, industry, phone, address, website });
    res.status(200).json({ success: true, message: 'Employer profile updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

const createEmployer = async (req, res, next) => {
  try {
    const { companyName, industry, email, phone, address, website } = req.body;
    const newEmp = await employersService.createEmployer({
      userId: req.user ? req.user.userId : null,
      companyName,
      industry,
      email: email || req.user.email,
      phone,
      address,
      website,
    });
    res.status(201).json({ success: true, message: 'Employer profile created.', data: newEmp });
  } catch (err) {
    next(err);
  }
};

const getEmployerById = async (req, res, next) => {
  try {
    const employerId = parseInt(req.params.id, 10);
    const employer = await employersService.getEmployerById(employerId);
    res.status(200).json({ success: true, data: employer });
  } catch (err) {
    next(err);
  }
};

const listEmployers = async (req, res, next) => {
  try {
    const { industry, search, limit, offset } = req.query;
    const result = await employersService.getAllEmployers({ industry, search, limit, offset });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  createEmployer,
  getEmployerById,
  listEmployers,
};
