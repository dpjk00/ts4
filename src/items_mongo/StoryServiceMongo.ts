import { MongoClient, ObjectId } from 'mongodb';
import { StoryMongo, StateMongo, PriorityMongo } from '../items_mongo/StoryMongo';

class StoryServiceMongo {
  private client: MongoClient;
  private dbName = 'dbmongo';
  private collectionName = 'stories';

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

  private doc_to_story(doc: any): StoryMongo {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      priority: doc.priority,
      project: doc.project,
      created: doc.created,
      state: doc.state,
      owner: doc.owner,
    };
  }

  async get_stories(): Promise<StoryMongo[]> {
    const collection = await this.get_collection();
    const stories = await collection.find({}).toArray();
    return stories.map(this.doc_to_story);
  }

  async add_story(name: string, description: string, priority: PriorityMongo, project: number, created: number, state: StateMongo, owner: number): Promise<StoryMongo | null> {
    const collection = await this.get_collection();

    const result = await collection.insertOne({ name, description, priority, project, created, state, owner });
    const insertedStoryId = result.insertedId;

    if (!insertedStoryId) {
      return null;
    }

    const insertedUser = await collection.findOne({ _id: insertedStoryId });
    return insertedUser ? this.doc_to_story(insertedUser) : null;
  }

  async get_user_by_name(username: string): Promise<StoryMongo | null> {
    const collection = await this.get_collection();
    const user = await collection.findOne({ username });
    return user ? this.doc_to_story(user) : null;
  }

  async get_user(id: string): Promise<StoryMongo | null> {
    const collection = await this.get_collection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return user ? this.doc_to_story(user) : null;
  }
}

export default new StoryServiceMongo();
