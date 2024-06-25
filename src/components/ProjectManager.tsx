import React, { useState, useEffect, ChangeEvent } from 'react';
import ProjectService from '../services/ProjectService';
import Project from '../models/Project';
import axios from 'axios';
import { Story, State, Priority } from '../models/Story';
import '../styles/project.css';
import '../index.css';
import StoryService from '../services/StoryService';
import SubStoryService from '../services/SubStoryService';
import UserService from '../services/UserService';
import { User } from '../models/User';
import { SubStory, Time } from '../models/SubStory';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const ProjectManager: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(ProjectService.get_active());
  const [newProject, setNewProject] = useState<{ name: string, description: string }>({
    name: '',
    description: '',
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [newStory, setNewStory] = useState<Partial<Story>>({
    name: '',
    description: '',
    priority: Priority.LOW,
    project: activeProject!,
    state: State.TODO,
    created: Date.now(),
    owner: undefined,
  });
  const [activeStory, setActiveStory] = useState<number | null>(StoryService.get_active());
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  useEffect(() => {
    setProjects(ProjectService.get_projects());
  }, []);

  useEffect(() => {
    setStories(StoryService.get_story_by_id(activeProject!));
    setUsers(UserService.get_users());
    setNoAdminUsers(UserService.get_users_no_admin())
  }, [activeProject]);

  const get_username_by_id = (id: number) => {
    const user = users.find(user => user.id === id);
    return user ? user.username : 'edytuj aby dodać';
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject(prevState => ({ ...prevState, [name]: value }));
  };

  const handleStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStory(prevState => ({ ...prevState, [name]: name === 'owner' ? Number(value) : value }));
  };

  const handleAddProject = () => {
    const id = Date.now();
    const project = new Project(id, newProject.name, newProject.description);
    ProjectService.add_project(project);
    setProjects(ProjectService.get_projects());
  };

  const handleEditStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingStory) {
      const { name, value } = e.target;
      setEditingStory({ ...editingStory, [name]: name === 'owner' ? Number(value) : value });
    }
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingProject) {
      const { name, value } = e.target;
      setEditingProject({ ...editingProject, [name]: value });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleUpdateProject = () => {
    if (editingProject) {
      ProjectService.update_project(editingProject);
      setProjects(ProjectService.get_projects());
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (id: number) => {
    ProjectService.delete_project(id);
    setProjects(ProjectService.get_projects());
  };

  const handleSetActiveProject = (id: number) => {
    setActiveProject(id);
    ProjectService.set_active(id);
  };

  const handleSetActiveStory = (id: number) => {
    setActiveStory(id);
    StoryService.set_active(id);
  }

  const handleShowAllProjects = () => {
    setActiveProject(null);
    ProjectService.clear_active();
  };

  const handleAddStory = () => {
    const storyToAdd = new Story(
      Date.now(),
      newStory.name || "",
      newStory.description || "",
      newStory.priority || Priority.LOW,
      activeProject!,
      newStory.created || Date.now(),
      newStory.state!,
      newStory.owner!,
    );
    StoryService.add_story(storyToAdd);
    setStories(StoryService.get_story_by_id(activeProject!));
    setNewStory({
      name: '',
      description: '',
      priority: Priority.LOW,
      project: activeProject!,
      created: Date.now(),
      state: State.TODO,
      owner: undefined,
    });
  };

  const handleDeleteStory = (id: number) => {
    StoryService.delete_story(id);
    setStories(StoryService.get_story_by_id(activeProject!));
  };

  const handleUpdateStory = () => {
    if (editingStory) {
      StoryService.update_story(editingStory);
      setStories(StoryService.get_story_by_id(activeProject!));
      setEditingStory(null);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const [substories, setSubStories] = useState<SubStory[]>([]);
  const [newSubStory, setNewSubStory] = useState<Partial<SubStory>>({
    name: '',
    description: '',
    priority: Priority.LOW,
    story: activeStory!,
    expected_time: Time.THREE,
    state: State.TODO,
    created: Date.now(),
    start: Date.now(),
    end: undefined,
    owner: undefined,
  });
  const [editingSubStory, setEditingSubStory] = useState<SubStory | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersNoAdmin, setNoAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    setSubStories(SubStoryService.get_substories_by_id(activeStory!));
    setUsers(UserService.get_users());
    setNoAdminUsers(UserService.get_users_no_admin());
  }, [activeStory]);

  const handleEditSubStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingSubStory) {
      const { name, value } = e.target;
      setEditingSubStory({ ...editingSubStory, [name]: name === 'owner' ? Number(value) : value });
    }
  };

  const handleSubStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSubStory(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddSubStory = () => {
    const subStoryToAdd = new SubStory(
      Date.now(),
      newSubStory.name || '',
      newSubStory.description || '',
      newSubStory.priority || Priority.LOW,
      newSubStory.story!,
      newSubStory.expected_time || Time.THREE,
      newSubStory.created!,
      newSubStory.end!,
      newSubStory.start!,
      newSubStory.state!,
      newSubStory.owner!
    );
    SubStoryService.add_substory(subStoryToAdd);
    console.log(subStoryToAdd.end)
    setSubStories(SubStoryService.get_substories_by_id(activeStory!));
    setNewSubStory({
      name: '',
      description: '',
      priority: Priority.LOW,
      story: activeStory!,
      start: Date.now(),
      end: Date.now(),
      expected_time: Time.THREE,
      created: Date.now(),
      state: State.TODO,
      owner: undefined,
    });
  };

  const handleDeleteSubStory = (id: number) => {
    SubStoryService.delete_substory(id);
    setSubStories(SubStoryService.get_substories_by_id(activeStory!));
  };

  const handleUpdateSubStory = () => {
    if (editingSubStory) {
      SubStoryService.update_substory(editingSubStory);
      setSubStories(SubStoryService.get_substories_by_id(activeStory!));
      setEditingSubStory(null);
    }
  };

  const handleEditSubStory = (subStory: SubStory) => {
    setEditingSubStory(subStory);
  };

  const handleShowAllStories = () => {
    setActiveStory(null);
    StoryService.clear_active()
  }

  const handleLogin = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  const handleRegister = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  return (
    <div className="w-screen flex flex-col items-center">
      <header className="w-screen h-20 flex justify-center items-center">
        <p className="text-5xl font-bold text-white text-center antialiased">ManageMe</p>
      </header>
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
    {activeProject === null ? (
      <>
        <div className="project-info">
          <input className="mt-4 text-white" type="text" name="name" placeholder="Nazwa projektu" value={newProject.name} onChange={handleInputChange} />
          <input className="mt-3 text-white" type="text" name="description" placeholder="Opis projektu" value={newProject.description} onChange={handleInputChange} />
          <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full" onClick={handleAddProject}>Dodaj projekt</button>
        </div>
        {editingProject && (
          <div className="edit-field">
            <h2 className="text-white text-3xl">Edit Project</h2>
            <input className="mt-4 text-white border-2" type="text" name="name" placeholder="Project Name" value={editingProject.name} onChange={handleEditInputChange} />
            <input className="mt-4 text-white border-2" type="text" name="description" placeholder="Project Description" value={editingProject.description} onChange={handleEditInputChange} />
            <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full" onClick={handleUpdateProject}>Edytuj</button>
            <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full" onClick={() => setEditingProject(null)}>Cofnij</button>
          </div>
        )}
        <div className="grid grid-cols-3 w-6/12 gap-6 mt-10">
          {projects.map(project => (
            <div className="flex flex-col w-100 border-2 border-white p-5" key={project.id}>
              <h2 className='text-white text-2xl'>{project.name}</h2>
              <p className='text-white text-lg'>{project.description}</p>
              <button className="bg-crimson hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5" onClick={() => handleEditProject(project)}>Edytuj</button>
              <button className="bg-crimson hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={() => handleDeleteProject(project.id)}>Usuń</button>
              <button className="bg-green hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={() => handleSetActiveProject(project.id)}>Aktywuj</button>
            </div>
          ))}
        </div>  
      </>
    ) : (
      <div>
        {projects.filter(project => project.id === activeProject).map(project => (
          <>
            <div className='flex justify-center items-center flex-col mt-4' key={project.id}>
              <h3 className='text-white text-4xl mt-2'>{project.name}</h3>
              <p className='text-white text-1xl mt-2'>{project.description}</p>
              <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={handleShowAllProjects}>Wróć do projetków</button>
            </div>
            {newStory && (
              <div className="flex justify-center items-center flex-col">
                <div className="flex justify-center items-center flex-col">
                  <input className="mt-4 text-white border-2 p-2" type="text" name="name" placeholder="Story title" value={newStory.name} onChange={handleStoryChange} />
                  <textarea className="mt-4 text-white border-2 p-2" name="description" placeholder="Story description" value={newStory.description} onChange={handleStoryChange} />
                  <div>
                    <select className="mt-4 text-white" value={newStory.state} name="state" id="" onChange={handleStoryChange}>
                      <option className="mt-4 text-white border-2" value={State.TODO}>Todo</option>
                      <option className="mt-4 text-white border-2" value={State.DOING}>Doing</option>
                      <option className="mt-4 text-white border-2" value={State.DONE}>Done</option>
                    </select>
                    <select className="mt-4 text-white ml-5" value={newStory.priority} name="priority" id="" onChange={handleStoryChange}>
                      <option className="mt-4 text-white border-2" value={Priority.HIGH}>High</option>
                      <option className="mt-4 text-white border-2" value={Priority.MEDIUM}>Medium</option>
                      <option className="mt-4 text-white border-2" value={Priority.LOW}>Low</option>
                    </select>
                  </div>
                  <button className="bg-crimson mt-2 hover:bg-blue-700 text-wshite mt-1 font-bold py-2 px-4 rounded-full" onClick={handleAddStory}>Add Story</button>
                </div>
              </div>
            )}
            <div className="flex justify-center mt-10">
              <div className="flex flex-col text-white border-2 p-5 max-w-96 min-w-96">
                <h2 className="text-3xl">TODO</h2>
                {stories.filter(story => story.state === State.TODO).map(story => (
                  <div key={story.id} className="mt-5">
                    <h3 className="text-xl">{story.name}</h3>
                    <p>{story.description}</p>
                    <p>Stan: {story.state}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Użytkownik: {get_username_by_id(story.owner)}</p>
                    <div className='flex justify-around'>
                      <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                      <button className="text-crimson" onClick={() => handleSetActiveStory(story.id)}>Idź do zadań</button>
                      <button className="text-crimson" onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col text-white border-2 p-5 ml-5 max-w-96 min-w-96">
                <h2 className="text-3xl">DOING</h2>
                {stories.filter(story => story.state === State.DOING).map(story => (
                  <div key={story.id}  className="mt-5">
                    <h3 className="text-xl">{story.name}</h3>
                    <p>{story.description}</p>
                    <p>Stan: {story.state}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Użytkownik: {get_username_by_id(story.owner)}</p>
                    <div className='flex justify-around'>
                      <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                      <button className="text-crimson" onClick={() => handleSetActiveStory(story.id)}>Idź do zadań</button>
                      <button className="text-crimson" onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col text-white border-2 p-5 ml-5 max-w-96 min-w-96">
                <h2 className="text-3xl">DONE</h2>
                {stories.filter(story => story.state === State.DONE).map(story => (
                  <div key={story.id} className="mt-5">
                    <h3 className="text-xl">{story.name}</h3>
                    <p>{story.description}</p>
                    <p>Stan: {story.state}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Użytkownik: {get_username_by_id(story.owner)}</p>
                    <div className='flex justify-around'>
                      <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                      <button className="text-crimson" onClick={() => handleSetActiveStory(story.id)}>Idź do zadań</button>
                      <button className="text-crimson" onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                    </div>
                    {activeStory !== null && (
                      <div className="main-div-sub">
                      <div>
                        <div className="flex flex-col justify-center items-center">
                          <h2 className="text-2xl mt-5">Zadanie dla <b className='text-crimson'>{StoryService.get_story(activeStory).name ?? "serwus"}</b></h2>
                        </div>
                        <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5" onClick={handleShowAllStories}>Pokaż wszystkie fukcjonalności</button>
                      </div>
                      {newSubStory && (
                        <div className="flex flex-col max-w-96 min-w-96 mt-7">
                          <h2 className='text-2xl'>Dodaj zadanie</h2>
                          <input className="mt-4 text-white border-2 p-2" type="text" name="name" placeholder="SubStory Name" value={newSubStory.name} onChange={handleSubStoryChange} />
                          <textarea className="mt-4 text-white border-2 p-2" name="description" placeholder="SubStory Description" value={newSubStory.description} onChange={handleSubStoryChange} />
                            <div className='flex justify-around items-center mt-5'>
                              <select name="priority" value={newSubStory.priority} onChange={handleSubStoryChange}>
                                <option value={Priority.HIGH}>High</option>
                                <option value={Priority.MEDIUM}>Medium</option>
                                <option value={Priority.LOW}>Low</option>
                              </select>
                              <select value={newSubStory.expected_time} name="expected_time" id="" onChange={handleSubStoryChange}>
                                <option value={Time.THREE}>3h</option>
                                <option value={Time.FIVE}>5h</option>
                                <option value={Time.EIGHT}>8h</option>
                              </select>
                            </div>
                          <button className='bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5' onClick={handleAddSubStory}>Dodaj zadanie</button>
                        </div>
                      )}
                      <div className="flex justify-center mt-10">
                        <div className="flex flex-col text-white border-2 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">TODO</h2>
                          {substories.filter(substory => substory.state === State.TODO).map(substory => (
                            <div key={story.id}  className="mt-5">
                              <h3 className="text-xl font-bold">{substory.name}</h3>
                              <p>{substory.description}</p>
                              <p>Stan: {substory.state}</p>
                              <p>Priorytet: {substory.priority}</p>
                              <p>Utworzono: {StoryService.convert_num_to_string(substory.created)}</p>
                              <p>Przewidywany czas: {substory.expected_time}</p>
                              <p>Użytkownik: {get_username_by_id(substory.owner)}</p>
                              <div className='flex justify-around'>
                                <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                <button className="text-crimson" onClick={() => handleDeleteSubStory(substory.id)}>Usuń</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col text-white border-2 ml-5 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">DOING</h2>
                          {substories.filter(substory => substory.state === State.DOING).map(substory => (
                            <div key={story.id}  className="mt-5">
                              <h3 className="text-xl font-bold">{substory.name}</h3>
                              <p>{substory.description}</p>
                              <p><b>Stan:</b> {substory.state}</p>
                              <p><b>Priorytet:</b> {substory.priority}</p>
                              <p><b>Utworzono:</b> {StoryService.convert_num_to_string(substory.created)}</p>
                              <p><b>Przewidywany czas:</b> {substory.expected_time}</p>
                              <p><b>Rozpoczęto:</b> {StoryService.convert_num_to_string(substory.start)}</p>
                              <p><b>Użytkownik:</b> {get_username_by_id(substory.owner)}</p>
                              <div className='flex justify-around'>
                                <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                <button className="text-crimson" onClick={() => handleDeleteSubStory(substory.id)}>Usuń</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col text-white border-2 ml-5 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">DONE</h2>
                          {substories.filter(substory => substory.state === State.DONE).map(substory => (
                            <div key={story.id}  className="mt-5">
                              <h3 className="text-xl font-bold">{substory.name}</h3>
                              <p>{substory.description}</p>
                              <p>Stan: {substory.state}</p>
                              <p>Priorytet: {substory.priority}</p>
                              <p>Utworzono: {StoryService.convert_num_to_string(substory.created)}</p>
                              <p>Przewidywany czas: {substory.expected_time}</p>
                              <p><b>Rozpoczęto:</b> {StoryService.convert_num_to_string(substory.start)}</p>
                              <p><b>Zakończono:</b> {StoryService.convert_num_to_string(substory.end)}</p>
                              <p>Użytkownik: {get_username_by_id(substory.owner)}</p>
                              <div className='flex justify-around'>
                                <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                <button className="text-crimson" onClick={() => handleDeleteSubStory(substory.id)}>Usuń</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {editingSubStory && (
                        <div className="edit-field">
                          <h2>Edytuj zadanie</h2>
                          <input type="text" name="name" value={editingSubStory.name} onChange={handleEditSubStoryChange} />
                          <textarea name="description" value={editingSubStory.description} onChange={handleEditSubStoryChange} />
                          <div>
                            <select name="owner" value={editingSubStory.owner} onChange={handleEditSubStoryChange}>
                              {usersNoAdmin.map(user => (
                                <option key={user.id} value={user.id}>{user.username}</option>
                              ))}
                            </select>
                            <select name="state" value={editingSubStory.state} onChange={handleEditSubStoryChange}>
                              <option value={State.TODO}>Todo</option>
                              <option value={State.DOING}>Doing</option>
                              <option value={State.DONE}>Done</option>
                            </select>
                          </div>
                          <button onClick={handleUpdateSubStory}>Edytuj</button>
                          <button onClick={() => setEditingSubStory(null)}>Cofnij</button>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ))}
        {editingStory && (
          <div className="edit-field">
            <h2 className="text-3xl">Edytuj funkcjonalność</h2>
            <input className="border-2 p-2 mt-8" type="text" name="name" placeholder='Nazwa' value={editingStory.name} onChange={handleEditStoryChange} />
            <textarea className='max-w-96 min-h-44 min-w-96 border-2 p-2' placeholder='Opis' name="description" value={editingStory.description} onChange={handleEditStoryChange} />
            <div>
              <select name="state" value={editingStory.state} onChange={handleEditStoryChange}>
                <option value={State.TODO}>Todo</option>
                <option value={State.DOING}>Doing</option>
                <option value={State.DONE}>Done</option>
              </select>
              <select className='ml-5' name="priority" value={editingStory.priority} onChange={handleEditStoryChange}>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.LOW}>Low</option>
              </select>
              <select className='ml-5' name="owner" value={editingStory.owner} onChange={handleEditStoryChange}>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <p>Utworzono: {StoryService.convert_num_to_string(editingStory.created)}</p>
            <div>
              <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={handleUpdateStory}>Edytuj</button>
              <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full ml-5" onClick={() => setEditingStory(null)}>Cofnij</button>
            </div>
          </div>
        )}
      </div>
    )}
    </>
      )}
    </div>
  );
};

export default ProjectManager;
