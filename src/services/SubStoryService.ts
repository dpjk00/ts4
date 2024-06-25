import {SubStory} from '../models/SubStory';
import { State } from '../models/Story';

class SubStoryService {
  private static localStorageKey = 'stories';

  static get_substories(): SubStory[] {
    const substoriesJson = localStorage.getItem(this.localStorageKey);
    if (substoriesJson) return JSON.parse(substoriesJson);
    return [];
  }

  static get_substory(id: number): SubStory | undefined {
    const substories = this.get_substories();
    return substories.find(substory => substory.id === id);
  }

  static add_substory(story: SubStory): void {
    let substories = this.get_substories();
    substories.push(story);
    localStorage.setItem(this.localStorageKey, JSON.stringify(substories));
  }

  static get_substories_by_id(id: number): SubStory[] {
    const substories = this.get_substories();
    return substories.filter(substories => substories.story === id);
  }

  static update_substory(updatedSubStory: SubStory): void {
    let substories = this.get_substories();
    const index = substories.findIndex(substory => substory.id === updatedSubStory.id);
    if (index !== -1) {
      if (updatedSubStory.state === State.DONE) updatedSubStory.end = Date.now();
      if (updatedSubStory.owner !== null) updatedSubStory.state = State.DOING;
      substories[index] = updatedSubStory;
      localStorage.setItem(this.localStorageKey, JSON.stringify(substories));
    }
  }

  static delete_substory(id: number): void {
    let substories = this.get_substories();
    const updatedSubStories = substories.filter(substory => substory.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedSubStories));
  }
}

export default SubStoryService;
