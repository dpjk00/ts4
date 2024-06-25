import {Story} from '../models/Story';

class StoryService {
  private static localStorageKey = 'stories';
  private static activeStoryKey = 'activeStory';

  static get_stories(): Story[] {
    const storiesJson = localStorage.getItem(this.localStorageKey);
    if (storiesJson) return JSON.parse(storiesJson);
    return [];
  }

  static get_story(id: number): Story | undefined {
    const stories = this.get_stories();
    return stories.find(story => story.id === id);
  }

  static add_story(story: Story): void {
    let stories = this.get_stories();
    stories.push(story);
    localStorage.setItem(this.localStorageKey, JSON.stringify(stories));
  }

  static get_story_by_id(id: number): Story[] {
    const stories = this.get_stories();
    return stories.filter(story => story.project === id);
  }

  static update_story(updatedStory: Story): void {
    let stories = this.get_stories();
    const index = stories.findIndex(story => story.id === updatedStory.id);
    if (index !== -1) {
      stories[index] = updatedStory;
      localStorage.setItem(this.localStorageKey, JSON.stringify(stories));
    }
  }

  static delete_story(id: number): void {
    let stories = this.get_stories();
    const updatedStories = stories.filter(story => story.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedStories));
  }

  static set_active(id: number): void {
    console.log(localStorage.getItem(JSON.stringify(id)))
    if (id === null) {
      localStorage.removeItem(this.activeStoryKey);
      return;
    }
    localStorage.setItem(this.activeStoryKey, JSON.stringify(id));
  }

  static clear_active(): void {
    localStorage.removeItem(this.activeStoryKey);
  }

  static get_active() : number | null {
    const active = localStorage.getItem(this.activeStoryKey);
    if (active) return parseInt(active)
    return null;
  }

  static convert_num_to_string(num: number) : string {
    const date = new Date(num);
    return date.toUTCString()
  }


}

export default StoryService;
