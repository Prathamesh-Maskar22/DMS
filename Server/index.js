import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

import entriesRoutes from './routes/entries.routes.js';
import mastersRouter from './routes/masters.routes.js'; // <--- Import this
import userRoutes from './routes/user.routes.js';

app.use('/api/v1/entries', entriesRoutes);
app.use('/api/v1/masters', mastersRouter);
app.use('/api/v1/users', userRoutes);

app.post('/api/v1/auth/login/', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ❌ User not found
  if (!user) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }

  // ❌ User inactive (IMPORTANT FIX)
  if (!user.is_active) {
    return res.status(403).json({ detail: 'User is deactivated. Contact admin.' });
  }

  // ❌ Password mismatch
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }

  // ✅ Generate tokens
  const access = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refresh = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    access,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

app.listen(5000, () => console.log('🚀 DMS Backend running on http://localhost:5000'));