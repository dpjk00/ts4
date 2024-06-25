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

enum Time {
  THREE = '3h',
  FIVE = '5h',
  EIGHT = '8h'
}

class SubStory {
  id: number;
  name: string;
  description: string;
  priority: Priority;
  story: number;
  expected_time: Time;
  state: State;
  created: number;
  start: number;
  end: number;
  owner: number;

  constructor(id: number, name: string, description: string, priority: Priority, story: number, expected_time: Time,
    created: number, end: number, start: number, state: State, owner: number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.story = story;
    this.expected_time = expected_time;
    this.created = created;
    this.end = end;
    this.start = start;
    this.state = state;
    this.owner = owner
  }
}

export { SubStory, Priority, State, Time };