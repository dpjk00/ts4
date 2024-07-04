import { MongoClient, ObjectId } from 'mongodb';
import { ProjectMongo } from '../items_mongo/ProjectMongo';
import Project from '../models/Project';

class ProjectServiceMongo {
  private client: MongoClient;
  private dbName = 'dbmongo';
  private collectionName = 'projects';

  private activeProjectKey = 'active';

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

  private doc_to_project(doc: any): ProjectMongo {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
    };
  }

  async get_projects(): Promise<ProjectMongo[]> {
    const collection = await this.get_collection();
    const stories = await collection.find({}).toArray();
    return stories.map((doc: any) => {
      return this.doc_to_project(doc);
    });
  }

  async add_project(title: string, description: string): Promise<ProjectMongo | null> {
    const collection = await this.get_collection();

    const result = await collection.insertOne({ title, description });
    const insertedStoryId = result.insertedId;

    if (!insertedStoryId) {
      return null;
    }

    const insertedUser = await collection.findOne({ _id: insertedStoryId });
    return insertedUser ? this.doc_to_project(insertedUser) : null;
  }

  async get_project_by_name(username: string): Promise<ProjectMongo | null> {
    const collection = await this.get_collection();
    const project = await collection.findOne({ username });
    return project ? this.doc_to_project(project) : null;
  }

  async get_project(id: string): Promise<ProjectMongo | null> {
    const collection = await this.get_collection();
    const project = await collection.findOne({ _id: new ObjectId(id) });
    return project ? this.doc_to_project(project) : null;
  }

  async update_project(id: string, title: string, description: string): Promise<ProjectMongo | null> {
    try {
      const collection = await this.get_collection();
  
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { title, description } },
        { returnDocument: 'after' }
      );
  
      return result.value ? this.doc_to_project(result.value) : null;
    } catch (error) {
      console.error('Error in update_project:', error);
      return null;
    }
  }
  async delete_project(id: string): Promise<boolean> {
    const collection = await this.get_collection();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  set_active(id: string): void {
    console.log(localStorage.getItem(JSON.stringify(id)))
    if (id === null) {
      localStorage.removeItem(this.activeProjectKey);
      return;
    }
    localStorage.setItem(this.activeProjectKey, JSON.stringify(id));
  }

  clear_active(): void {
    localStorage.removeItem(this.activeProjectKey);
  }

  get_active() : number | null {
    const active = localStorage.getItem(this.activeProjectKey);
    if (active) return parseInt(active)
    return null;
  }
}

export default new ProjectServiceMongo();
