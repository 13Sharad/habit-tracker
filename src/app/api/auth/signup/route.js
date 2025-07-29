// app/api/auth/signup/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  // check existing user
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 });
  }

  // hash password
  const hash = await bcrypt.hash(password, 12);

  // insert
  await users.insertOne({ email, password: hash, createdAt: new Date() });

  return NextResponse.json({ message: 'User created' }, { status: 201 });
}
