import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

function getUserId(req) {
  const auth = req.headers.get('authorization');
  if (!auth) throw new Error('Unauthorized');
  return jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET).sub;
}

// GET current global streak
export async function GET(req) {
  try {
    const userId = getUserId(req);
    const client = await clientPromise;
    const db     = client.db();

    // fetch last 30 days of completions
    const rows = await db.collection('completions')
      .find({ userId })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    let streak = 0;
    let day    = new Date().setHours(0,0,0,0);

    // count backwards while done===true
    for (; ; day -= 86400000) {
      const record = rows.find(r => new Date(r.date).getTime() === day);
      if (record && record.done) streak++;
      else break;
    }

    return new Response(JSON.stringify({ streak }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return new Response(JSON.stringify({ message: err.message }), { status });
  }
}
