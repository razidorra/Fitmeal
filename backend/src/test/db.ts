import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Shared in-memory MongoDB helper for tests that need real Mongoose queries (ownership scoping,
// route integration tests) instead of mocked model methods. One instance per test file.
let mongod: MongoMemoryServer | null = null;

/** Starts an in-memory MongoDB instance and connects Mongoose to it. Call from a `beforeAll`. */
export async function connectTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

/** Disconnects Mongoose and stops the in-memory instance. Call from an `afterAll`. */
export async function disconnectTestDb() {
  await mongoose.disconnect();
  await mongod?.stop();
  mongod = null;
}

/** Empties every collection between tests so one case can't leak state into the next. */
export async function clearTestDb() {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
}
