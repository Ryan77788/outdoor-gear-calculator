import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("请在 .env.local 中配置 MONGODB_URI");
}

let client: MongoClient;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise;

export default clientPromise;
