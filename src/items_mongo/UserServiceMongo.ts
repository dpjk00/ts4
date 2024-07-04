import { MongoClient, ObjectId } from 'mongodb';
import { UserMongo, UserRole } from '../items_mongo/UserMongo';

class UserServiceMongo {
  private client: MongoClient;
  private dbName = 'dbmongo';
  private collectionName = 'users';

    constructor() {
    const uri = "mongodb+srv://msn:Damianowo2@projekt.emn7xmh.mongodb.net/?retryWrites=true&w=majority&appName=Projekt";
    this.client = new MongoClient(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    this.client.connect().then(() => {
      console.log('Connected to MongoDB');
    }).catch(err => {
      console.error('Error connecting to MongoDB', err);
    });
  }

  private async get_collection() {
    return this.client.db(this.dbName).collection(this.collectionName);
  }

  private doc_to_user(doc: any): UserMongo {
    return {
      id: doc._id.toString(),
      username: doc.username,
      password: doc.password,
      role: doc.role
    };
  }

  async get_users(): Promise<UserMongo[]> {
    const collection = await this.get_collection();
    const users = await collection.find({}).toArray();
    return users.map(this.doc_to_user);
  }

  async add_user(username: string, password: string, role: UserRole): Promise<UserMongo | null> {
    const collection = await this.get_collection();
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return null;
    }
    
    const result = await collection.insertOne({ username, password, role });
    const insertedUserId = result.insertedId;

    if (!insertedUserId) {
      return null;
    }

    const insertedUser = await collection.findOne({ _id: insertedUserId });
    return insertedUser ? this.doc_to_user(insertedUser) : null;
  }

  async get_user_by_name(username: string): Promise<UserMongo | null> {
    const collection = await this.get_collection();
    const user = await collection.findOne({ username });
    return user ? this.doc_to_user(user) : null;
  }

  async get_user(id: string): Promise<UserMongo | null> {
    const collection = await this.get_collection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return user ? this.doc_to_user(user) : null;
  }
}

export default new UserServiceMongo();
