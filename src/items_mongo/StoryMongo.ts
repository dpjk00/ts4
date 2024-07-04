import { ObjectId } from "mongodb";

export enum PriorityMongo {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum StateMongo {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE'
}

export interface StoryMongo {
  id: string;
  name: string;
  description: string;
  priority: PriorityMongo;
  project: number;
  created: number;
  state: StateMongo;
  owner: number;
}