import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

// extract userId or throw 401
function getUserId(req) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new Response(
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401 }
    );
  }
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return new ObjectId(payload.sub);
  } catch (err) {
    throw new Response(
      JSON.stringify({ message: 'Invalid or expired token' }),
      { status: 401 }
    );
  }
}

// bump streak & history
function updateStreak(habit) {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastDate = habit.lastCompleted
    ? new Date(habit.lastCompleted).setHours(0, 0, 0, 0)
    : null;

  // if already marked today, do nothing
  if (lastDate === today) return habit;

  // update streak count
  habit.streak = (lastDate === today - 86400000)
    ? habit.streak + 1
    : 1;

  habit.lastCompleted = new Date();
  habit.history.push(new Date());
  return habit;
}

// update global completion summary
async function upsertCompletion(db, userId) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const doneCount = await db.collection('habits').countDocuments({
    userId,
    lastCompleted: {
      $gte: new Date(todayStart),
      $lt:  new Date(todayStart + 86400000),
    },
  });
  const totalCount = await db.collection('habits').countDocuments({ userId });

  await db.collection('completions').updateOne(
    { userId, date: new Date(todayStart) },
    { $set: { done: doneCount === totalCount } },
    { upsert: true }
  );
}

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'Missing habit ID' }),
        { status: 400 }
      );
    }

    const userId = getUserId(req);
    const client = await clientPromise;
    const db = client.db();
    const objId = new ObjectId(id);

    // find the habit
    const habit = await db.collection('habits').findOne({
      _id: objId,
      userId
    });
    if (!habit) {
      return new Response(
        JSON.stringify({ message: 'Not found' }),
        { status: 404 }
      );
    }

    // update streak and save
    const updated = updateStreak(habit);
    await db.collection('habits').updateOne(
      { _id: objId, userId },
      { $set: {
          streak: updated.streak,
          lastCompleted: updated.lastCompleted,
          history: updated.history
        } }
    );

    // update global completion summary
    await upsertCompletion(db, userId);

    // return updated document
    return new Response(
      JSON.stringify(updated),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Toggle error:', err);
    const status = err instanceof Response ? err.status : 500;
    const msg = err instanceof Response
      ? await err.text()
      : err.message;
    return new Response(JSON.stringify({ message: msg }), { status });
  }
}
