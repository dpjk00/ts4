import {Story} from '../models/Story';

class StoryService {
  private localStorageKey = 'stories';
  private activeStoryKey = 'activeStory';

   get_stories(): Story[] {
    const storiesJson = localStorage.getItem(this.localStorageKey);
    if (storiesJson) return JSON.parse(storiesJson);
    return [];
  }

   get_story(id: number): Story | undefined {
    const stories = this.get_stories();
    return stories.find(story => story.id === id);
  }

   add_story(story: Story): void {
    let stories = this.get_stories();
    stories.push(story);
    localStorage.setItem(this.localStorageKey, JSON.stringify(stories));
  }

   get_story_by_id(id: number): Story[] {
    const stories = this.get_stories();
    return stories.filter(story => story.project === id);
  }

   update_story(updatedStory: Story): void {
    let stories = this.get_stories();
    const index = stories.findIndex(story => story.id === updatedStory.id);
    if (index !== -1) {
      stories[index] = updatedStory;
      localStorage.setItem(this.localStorageKey, JSON.stringify(stories));
    }
  }

   delete_story(id: number): void {
    let stories = this.get_stories();
    const updatedStories = stories.filter(story => story.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedStories));
  }

  set_active(id: number): void {
    console.log(localStorage.getItem(JSON.stringify(this.get_story(id))))
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

   convert_num_to_string(num: number) : string {
    const date = new Date(num);
    return date.toUTCString()
  }
}

export default new StoryService;
