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

export enum TimeMongo {
  THREE = '3h',
  FIVE = '5h',
  EIGHT = '8h'
}

export interface SubStoryMongo {
  id: string;
  name: string;
  description: string;
  priority: PriorityMongo;
  story: string;
  expected_time: TimeMongo;
  state: StateMongo;
  created: number;
  start: number;
  end: number;
  owner: number;
}