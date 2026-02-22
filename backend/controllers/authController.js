import jwt from "jsonwebtoken"
import User from "../models/User.js"

//////////////////////////////////////////////////////////
// Generate JWT
//////////////////////////////////////////////////////////
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  )
}

//////////////////////////////////////////////////////////
// REGISTER
//////////////////////////////////////////////////////////
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      })
    }

    const user = await User.create({
      username,
      email,
      password
    })

    const token = generateToken(user)

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      token,
      message: "User registered successfully"
    })

  } catch (error) {
    next(error)
  }
}

//////////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////////
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const token = generateToken(user)

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      },
      token,
      message: "Login successful"
    })

  } catch (error) {
    next(error)
  }
}

//////////////////////////////////////////////////////////
// GET PROFILE
//////////////////////////////////////////////////////////
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    next(error)
  }
}

//////////////////////////////////////////////////////////
// UPDATE PROFILE
//////////////////////////////////////////////////////////
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Prevent duplicate email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email })
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        })
      }
    }

    user.username = username || user.username
    user.email = email || user.email
    user.profileImage = profileImage || user.profileImage

    await user.save()

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      },
      message: "Profile updated successfully"
    })

  } catch (error) {
    next(error)
  }
}

//////////////////////////////////////////////////////////
// CHANGE PASSWORD
//////////////////////////////////////////////////////////
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both old and new passwords are required"
      })
    }

    const user = await User.findById(req.user.id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const isMatch = await user.matchPassword(oldPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    })

  } catch (error) {
    next(error)
  }
}