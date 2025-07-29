import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

export async function GET(req) {
  try {
    const token = req.headers.get('authorization');
    const { sub: userId } = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

    const client = await clientPromise;
    const db     = client.db();

    const docs = await db.collection('completions')
      .find({ userId: new ObjectId(userId), done: true })
      .sort({ date: -1 })
      .toArray();

    const dates = docs.map(d => new Date(d.date).toISOString().slice(0,10));
    return new Response(JSON.stringify({ dates }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
