import Project from '../models/Project';


class ProjectService {

  private localStorageKey = 'projects';
  private activeProjectKey = 'active';

  get_projects(): Project[] {
    const projects = localStorage.getItem(this.localStorageKey);
    return projects ? JSON.parse(projects) as Project[] : [];
  }

  get_project(id: number): Project | undefined {
    const projects = this.get_projects();
    return projects.find(project => project.id === id);
  }

  set_active(id: number): void {
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

  add_project(project: Project): void {
    const projects = this.get_projects();
    projects.push(project);
    localStorage.setItem(this.localStorageKey, JSON.stringify(projects));
  }

  update_project(updatedProject: Project): void {
    let projects = this.get_projects();
    projects = projects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
    );
    localStorage.setItem(this.localStorageKey, JSON.stringify(projects));
  }

  delete_project(id: number): void {
    let projects = this.get_projects();
    projects = projects.filter(project => project.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(projects));
  }
}

export default new ProjectService();