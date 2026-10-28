const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { email, password, role, fullName, companyName, providerName, phone, address, educationLevel, industry } = req.body;
    const result = await authService.registerUser({
      email,
      password,
      role,
      fullName,
      companyName,
      providerName,
      phone,
      address,
      educationLevel,
      industry,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getCurrentUserProfile(req.user);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
