// src/controllers/user.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
    //   where: { is_active: true },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        is_active: true,
        created_at: true,
      }, // ❌ exclude password
    });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, role, name, is_active } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email & Password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name,
        is_active,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, name, is_active } = req.body;

    let updateData = {
      email,
      role,
      name,
      is_active,
    };

    // ✅ Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id: Number(id) },
      data: { is_active: false },
    });

    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};