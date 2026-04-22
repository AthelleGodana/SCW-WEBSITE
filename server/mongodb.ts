import { MongoClient, Db, ObjectId } from "mongodb";
import { ENV } from "./_core/env";

let _client: MongoClient | null = null;
let _db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scw_website";

export async function getDb(): Promise<Db> {
  if (_db) return _db;

  if (!_client) {
    _client = new MongoClient(MONGODB_URI);
    await _client.connect();
  }

  _db = _client.db();
  return _db;
}

export { ObjectId };
