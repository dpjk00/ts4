import { MongoClient, ObjectId } from 'mongodb';
import { SubStoryMongo, StateMongo, PriorityMongo, TimeMongo } from './SubStoryMongo';

class StoryServiceMongo {
  private client: MongoClient;
  private dbName = 'dbmongo';
  private collectionName = 'substories';

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

  private doc_to_story(doc: any): SubStoryMongo {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      priority: doc.priority,
      story: doc.story,
      expected_time: doc.expected_time,
      state: doc.state,
      created: doc.created,
      start: doc.start,
      end: doc.end,
      owner: doc.owner,
    };
  }

  async get_substories(): Promise<SubStoryMongo[]> {
    const collection = await this.get_collection();
    const substories = await collection.find({}).toArray();
    return substories.map(this.doc_to_story);
  }

  async add_substory(name: string, description: string, priority2: PriorityMongo, story: string, expected_time2: TimeMongo, state2: StateMongo, created: number, start: number, end: number, owner?: number): Promise<SubStoryMongo | null> {
    const collection = await this.get_collection();

    const priority = priority2.toString().toUpperCase()
    const state = state2.toString().toUpperCase()
    const expected_time = expected_time2.toString().toUpperCase()

    console.log("Przed dodaniem:", priority, state, expected_time)
    const result = await collection.insertOne({ name, description, priority, story, expected_time, state, created, start, end, owner });
    const insertedSubStoryId = result.insertedId;

    if (!insertedSubStoryId) {
      return null;
    }

    const insertedSubStory = await collection.findOne({ _id: insertedSubStoryId });
    return insertedSubStory ? this.doc_to_story(insertedSubStory) : null;
  }

  async delete_substory(id: string): Promise<boolean> {
    const collection = await this.get_collection();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  async update_substory(id: string, name: string, description: string, state2: StateMongo, priority2: PriorityMongo, start: number, end: number, owner: string): Promise<SubStoryMongo | null> {
    try {
      const collection = await this.get_collection();
      
      const state = state2.toString().toUpperCase()
      const priority = priority2.toString().toUpperCase()

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { name, description, state, priority, start, end, owner} },
        { returnDocument: 'after' }
      );

      console.log("result", result)

      return result ? this.doc_to_story(result) : null;
    } catch (error) {
      console.error('Error in update_substory:', error);
      return null;
    }
  }

  async get_substory_by_name(name: string): Promise<SubStoryMongo | null> {
    const collection = await this.get_collection();
    const story = await collection.findOne({ name });
    return story ? this.doc_to_story(story) : null;
  }

  async get_substory(id: string): Promise<SubStoryMongo | null> {
    const collection = await this.get_collection();
    const story = await collection.findOne({ _id: new ObjectId(id) });
    return story ? this.doc_to_story(story) : null;
  }
}

export default new StoryServiceMongo();
