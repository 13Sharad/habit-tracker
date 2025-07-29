
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET2 = process.env.JWT_SECRET;
if (!JWT_SECRET2) throw new Error('Missing JWT_SECRET');

function getUserId2(req) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const { sub } = jwt.verify(token, JWT_SECRET2);
    return sub;
  } catch (err) {
    throw new Response(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401 });
  }
}

export async function GET(req, { params }) {
  try {
    const userId = getUserId2(req);
    const client = await clientPromise;
    const db = client.db();
    const habit = await db.collection('habits').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });
    if (!habit) {
      return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(habit), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const status = err instanceof Response ? err.status : 500;
    const msg = err instanceof Response ? await err.json() : { message: err.message };
    return new Response(JSON.stringify(msg), { status });
  }
}

export async function PATCH(req, { params }) {
  try {
    const userId = getUserId2(req);
    const updates = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const { value } = await db.collection('habits').findOneAndUpdate(
      { _id: new ObjectId(params.id), userId: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!value) {
      return new Response(JSON.stringify({ message: 'Not found or no permission' }), { status: 404 });
    }
    return new Response(JSON.stringify(value), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const status = err instanceof Response ? err.status : 500;
    const msg = err instanceof Response ? await err.json() : { message: err.message };
    return new Response(JSON.stringify(msg), { status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = getUserId2(req);
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('habits').deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: 'Not found or no permission' }), { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    const status = err instanceof Response ? err.status : 500;
    const msg = err instanceof Response ? await err.json() : { message: err.message };
    return new Response(JSON.stringify(msg), { status });
  }
}
