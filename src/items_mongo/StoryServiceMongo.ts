import { MongoClient, ObjectId } from 'mongodb';
import { StoryMongo, StateMongo, PriorityMongo } from '../items_mongo/StoryMongo';

class StoryServiceMongo {
  private client: MongoClient;
  private dbName = 'dbmongo';
  private collectionName = 'stories';

  private activeStoryKey = 'activeStory';

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

  async add_story(name: string, description: string, priority2: PriorityMongo, project: string, created: number, state2: StateMongo, owner?: number): Promise<StoryMongo | null> {
    const collection = await this.get_collection();

    const priority = priority2.toString().toUpperCase()
    const state = state2.toUpperCase()

    console.log("Przed dodaniem:", priority, state)
    const result = await collection.insertOne({ name, description, priority, project, created, state, owner });
    const insertedStoryId = result.insertedId;

    if (!insertedStoryId) {
      return null;
    }

    const insertedStory = await collection.findOne({ _id: insertedStoryId });
    return insertedStory ? this.doc_to_story(insertedStory) : null;
  }

  async delete_story(id: string): Promise<boolean> {
    const collection = await this.get_collection();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  async update_story(id: string, name: string, description: string, state2: StateMongo, priority2: PriorityMongo, owner: string): Promise<StoryMongo | null> {
    try {
      const collection = await this.get_collection();
      
      const state = state2.toString().toUpperCase()
      const priority = priority2.toString().toUpperCase()

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { name, description, state, priority, owner } },
        { returnDocument: 'after' }
      );

      console.log("result", result)

      return result ? this.doc_to_story(result) : null;
    } catch (error) {
      console.error('Error in update_project:', error);
      return null;
    }
  }

  async get_story_by_name(name: string): Promise<StoryMongo | null> {
    const collection = await this.get_collection();
    const story = await collection.findOne({ name });
    return story ? this.doc_to_story(story) : null;
  }

  async get_story(id: string): Promise<StoryMongo | null> {
    const collection = await this.get_collection();
    const story = await collection.findOne({ _id: new ObjectId(id) });
    return story ? this.doc_to_story(story) : null;
  }

  set_active(id: number): void {
    console.log(localStorage.getItem(JSON.stringify(this.get_story(id.toString()))))
    if (id === null) {
      localStorage.removeItem(this.activeStoryKey);
      return;
    }
    localStorage.setItem(this.activeStoryKey, JSON.stringify(id));
  }

  clear_active(): void {
    localStorage.removeItem(this.activeStoryKey);
  }

  get_active() : number | null {
    const active = localStorage.getItem(this.activeStoryKey);
    if (active) return parseInt(active)
    return null;
  }
}

export default new StoryServiceMongo();
