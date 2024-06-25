enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

enum State {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done'
}

class Story {
  id: number;
  name: string;
  description: string;
  priority: Priority;
  project: number;
  created: number;
  state: State;
  owner: number;

  constructor(id: number, name: string, description: string, priority: Priority, project: number, created: number, state: State, owner: number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.project = project;
    this.created = created;
    this.state = state;
    this.owner = owner
  }
}

export { Story, Priority, State };