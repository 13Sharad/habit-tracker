
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

function getUserId(req) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const { sub } = jwt.verify(token, JWT_SECRET);
    return sub;
  } catch (err) {
    throw new Response(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
  }
}

// GET: List all habits for the user
export async function GET(req) {
  try {
    const userId = getUserId(req);
    const client = await clientPromise;
    const db = client.db();
    const habits = await db
      .collection('habits')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    return new Response(JSON.stringify(habits), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

// POST: Create a new habit
export async function POST(req) {
  try {
    const userId = getUserId(req);
    const { title, description, dueTime } = await req.json();
    if (!title || !dueTime) {
      return new Response(JSON.stringify({ message: 'Title and dueTime are required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('habits').insertOne({
      userId: new ObjectId(userId),
      title,
      description: description || '',
      dueTime,
      streak: 0,
      lastCompleted: null,
      history: [],
      createdAt: new Date(),
    });
    const habit = await db.collection('habits').findOne({ _id: result.insertedId });
    return new Response(JSON.stringify(habit), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const status = err instanceof Response ? err.status : 500;
    const msg = err instanceof Response ? await err.json() : { message: err.message };
    return new Response(JSON.stringify(msg), { status });
  }
}
