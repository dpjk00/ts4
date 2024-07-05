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
import { UserMongo } from '../items_mongo/UserMongo';
import { ProjectMongo } from '../items_mongo/ProjectMongo';
import { StoryMongo, StateMongo, PriorityMongo } from '../items_mongo/StoryMongo'
import { SubStoryMongo, TimeMongo } from '../items_mongo/SubStoryMongo'
import ProjectServiceMongo from '../items_mongo/ProjectServiceMongo';
import UserServiceMongo from '../items_mongo/UserServiceMongo';
import StoryServiceMongo from '../items_mongo/StoryServiceMongo';
import { User } from '../models/User';
import { SubStory, Time } from '../models/SubStory';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import notificationService from '../items_mongo/NotificationService';
import { Notification } from '../items_mongo/NotificationService';
import { verifyToken } from '../api/api'

const ProjectManager: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(ProjectService.get_active());
  const [newProject, setNewProject] = useState<{ title: string, description: string }>({
    title: '',
    description: '',
  });
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

  const [users, setUsers] = useState<User[]>([]);

  const [usersApi, setUsersApi] = useState<UserMongo[]>([]);
  const [projectsApi, setProjectsApi] = useState<ProjectMongo[]>([]);
  const [titleProject, setTitleProject] = useState('');
  const [descriptionProject, setDescriptionProject] = useState('');
  const [editingProjectApi, setEditingProjectApi] = useState<ProjectMongo | null>(null);
  const [activeProjectApi, setActiveProjectApi] = useState<string | null>(null);
  const [activeStoryApi, setActiveStoryApi] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  //SUBSTORIES API
  const [substoriesApi, setSubStoriesApi] = useState<SubStoryMongo[]>([]);
  const [newSubStoryApi, setNewSubStoryApi] = useState<Partial<SubStoryMongo>>({
    name: '',
    description: '',
    priority: PriorityMongo.LOW,
    story: activeStoryApi!,
    expected_time: TimeMongo.THREE,
    state: StateMongo.TODO,
    created: Date.now(),
    start: undefined,
    end: undefined,
    owner: null!,
  });

  // STRIES API
  const [storiesApi, setStoriesApi] = useState<StoryMongo[]>([]);
  const [newStoryApi, setNewStoryApi] = useState<Partial<StoryMongo>>({
    name: '',
    description: '',
    priority: PriorityMongo.LOW,
    project: activeProjectApi!,
    state: StateMongo.TODO,
    created: Date.now(),
    owner: null!,
  });
  const [editingStoryApi, setEditingStoryApi] = useState<StoryMongo | null>(null);

  // NOTIFICATIONS
  const [unreadCount, setUnreadCount] = useState<number>(0);
  useEffect(() => {
    const subscription = notificationService.unread_count().subscribe(setUnreadCount);
    return () => subscription.unsubscribe();
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    const subscription = notificationService.list().subscribe(setNotifications);
    return () => subscription.unsubscribe();
  }, []);
  const [notificationView, setNotificationView] = useState<boolean>(false);

  // AUTHORIZATION1
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (savedToken && expirationTime && new Date().getTime() < parseInt(expirationTime)) {
      setToken(JSON.parse(savedToken));
      setIsAuthenticated(true);
    } else {
      handleLogout(); // Remove token if expired
    }
  }, []);


  const [usersNoAdmin, setNoAdminUsers] = useState<User[]>([]);
  useEffect(() => {
    setProjects(ProjectService.get_projects());
  }, []);

  useEffect(() => {
    setStories(StoryService.get_story_by_id(activeProject!));
    setUsers(UserService.get_users());
    setActiveStory(null);
    setNoAdminUsers(UserService.get_users_no_admin())
  }, [activeProject]);

  const [substories, setSubStories] = useState<SubStory[]>([]);
  const [newSubStory, setNewSubStory] = useState<Partial<SubStory>>({
    name: '<TYTUŁ DOMYŚLNY>',
    description: '<OPIS DOMYŚLNY>',
    priority: Priority.LOW,
    story: activeStory!,
    expected_time: Time.THREE,
    state: State.TODO,
    created: Date.now(),
    start: undefined,
    end: undefined,
    owner: undefined,
  });
  const [editingSubStoryApi, setEditingSubStoryApi] = useState<SubStoryMongo | null>(null);

  const get_username_by_id_api = (id: number) => {
    if (id === undefined) { 
      console.log("undefined user")
      return 'edytuj aby dodać';
    }
    if (id === null) return 'edytuj aby dodać';
    const user = usersApi.find(user => user.id === id.toString());
    return user ? user.username : 'edytuj aby dodać';
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title') setTitleProject(value);
    if (name === 'description') setDescriptionProject(value);
    setNewProject(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEditStoryChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingStoryApi) {
      const { name, value } = e.target;
      setEditingStoryApi({ ...editingStoryApi, [name]: name === 'owner' || name === 'state' || name === 'priority' ? String(value) : value });
    }
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingProjectApi) {
      const { name, value } = e.target;
      setEditingProjectApi({ ...editingProjectApi, [name]: value });
    }
  };

  const handleEditProjectApi = (project: ProjectMongo) => {
    setEditingProjectApi(project);
  };
  
  const handleUpdateProjectApi = async () => {
    if (!editingProjectApi) {
      console.error('Editing project is null or undefined');
      return;
    }

    console.log(editingProjectApi)
  
    try {
      const response = await axios.post(`http://localhost:3000/update_project/${editingProjectApi.id}`, {
        title: editingProjectApi.title,
        description: editingProjectApi.description,
      });
  
      const updatedProject = response.data;
  
      setProjectsApi(prevProjects=> {
        console.log("Previous stories:", prevProjects);
        console.log("Updated Project:", updatedProject);
        return prevProjects.map(project => {
          if (project.id === updatedProject.id) {
            console.log("Updating project:", project);
            return updatedProject;
          }
          return project;
        });
      });
      
      getProjectData();
      //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, newStory] : [newStory]));
      //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, updatedStory] : [updatedStory]));
      setEditingProjectApi(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleUpdateStoryApi = async () => {
    if (!editingStoryApi) {
      console.error('Editing project is null or undefined');
      return;
    }

    console.log(editingStoryApi)
  
    try {
      const response = await axios.post(`http://localhost:3000/update_story/${editingStoryApi.id}`, {
        name: editingStoryApi.name,
        description: editingStoryApi.description,
        state: editingStoryApi.state,
        priority: editingStoryApi.priority,
        owner: editingStoryApi.owner
      });
  
      const updatedStory = response.data;
  
      setStoriesApi(prevStories => {
        console.log("Previous stories:", prevStories);
        console.log("Updated story:", updatedStory);
        return prevStories.map(story => {
          if (story.id === updatedStory.id) {
            console.log("Updating story:", story);
            return updatedStory;
          }
          return story;
        });
      });
      
      getStoryData();
      //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, newStory] : [newStory]));
      //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, updatedStory] : [updatedStory]));
      setEditingStoryApi(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleUpdateSubStoryApi = async () => {
    if (!editingSubStoryApi) {
      console.error('Editing project is null or undefined');
      return;
    }

    console.log(editingSubStoryApi)
  
    try {
      if (editingSubStoryApi.state.toUpperCase() === StateMongo.DOING.toString()) {
        const response = await axios.post(`http://localhost:3000/update_substory/${editingSubStoryApi.id}`, {
          name: editingSubStoryApi.name,
          description: editingSubStoryApi.description,
          state: editingSubStoryApi.state,
          priority: editingSubStoryApi.priority,
          start: Date.now(),
          owner: editingSubStoryApi.owner
        });
    
        const updatedSubStory = response.data;
    
        setSubStoriesApi(prevSubStories => {
          console.log("Previous stories:", prevSubStories);
          console.log("Updated story:", updatedSubStory);
          return prevSubStories.map(substory => {
            if (substory.id === updatedSubStory.id) {
              console.log("Updating story:", substory);
              return updatedSubStory;
            }
            return substory;
          });
        });
        getSubStoryData();
        
        //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, newStory] : [newStory]));
        //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, updatedStory] : [updatedStory]));
        setEditingSubStoryApi(null);
      }
      else if (editingSubStoryApi.state.toUpperCase() === StateMongo.DONE.toString()) {
        const response = await axios.post(`http://localhost:3000/update_substory/${editingSubStoryApi.id}`, {
          name: editingSubStoryApi.name,
          description: editingSubStoryApi.description,
          state: editingSubStoryApi.state,
          priority: editingSubStoryApi.priority,
          start:  editingSubStoryApi.start,
          end: Date.now(),
          owner: editingSubStoryApi.owner
        });
    
        const updatedSubStory = response.data;
    
        setSubStoriesApi(prevSubStories => {
          console.log("Previous stories:", prevSubStories);
          console.log("Updated story:", updatedSubStory);
          return prevSubStories.map(substory => {
            if (substory.id === updatedSubStory.id) {
              console.log("Updating story:", substory);
              return updatedSubStory;
            }
            return substory;
          });
        });
        getSubStoryData();
        
        //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, newStory] : [newStory]));
        //setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, updatedStory] : [updatedStory]));
        setEditingSubStoryApi(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProjectApi = async (projectId) => {
    try {
      await axios.post(`http://localhost:3000/delete_project/${projectId}`);
      setProjectsApi((prevProjects) => {
        if (!Array.isArray(prevProjects)) {
          console.error('prevProjects is not an array:', prevProjects);
          return [];
        }
        return prevProjects.filter(project => project.id !== projectId);
      });
      console.log(token)
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSetActiveProjectApi = async (id: string) => {
    try {
      await axios.post(`http://localhost:3000/set_active_project/${id}`);
      setActiveProjectApi(id);
    } catch (error) {
      console.error('Error setting active project:', error);
    }
  };

  const handleSetActiveStoryApi = async (id: string) => {
    try {
      await axios.post(`http://localhost:3000/set_active_project/${id}`);
      setActiveStoryApi(id);
    } catch (error) {
      console.error('Error setting active project:', error);
    }
  };

  const handleShowAllProjects =async () => {
    try {
      setActiveProjectApi(null);
    } catch (error) {
      console.error('Error setting active project to null:', error);
    }
    setActiveProjectApi(null);
    ProjectService.clear_active();
  };

  const handleAddProjectApi = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/add_project', {
        title: titleProject,
        description: descriptionProject,
      });
      const newProject = response.data.project;
      setProjectsApi((prevProjects) => (Array.isArray(prevProjects) ? [...prevProjects, newProject] : [newProject]));
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleAddStoryApi = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/add_story', {
        name: newStoryApi.name,
        description: newStoryApi.description,
        priority: newStoryApi.priority,
        project: activeProjectApi!,
        created: newStoryApi.created,
        state: newStoryApi.state,
        owner: token.userid,
      });
      const newStory = response.data.story;
      // Handle state update or feedback after adding the story
      console.log('New story added:', newStory);
      setNewStoryApi({
        name: '',
        description: '',
        priority: PriorityMongo.LOW,
        project: activeProjectApi!,
        created: Date.now(),
        state: StateMongo.TODO,
        owner: undefined,
      });
      setStoriesApi((prevStories) => (Array.isArray(prevStories) ? [...prevStories, newStory] : [newStory]));
      assignStory(newStoryApi.name, newStoryApi.owner, newStoryApi.priority)
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  const handleAddSubStoryApi = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/add_substory', {
        name: newSubStoryApi.name,
        description: newSubStoryApi.description,
        priority: newSubStoryApi.priority,
        story: activeStoryApi!,
        expected_time: newSubStoryApi.expected_time,
        state: StateMongo.TODO,
        created: newSubStoryApi.created,
        start: newSubStoryApi.start,
        end: newSubStoryApi.end,
        owner: newSubStoryApi.owner,
      });
      const newSubStory = response.data.substory;
      // Handle state update or feedback after adding the story
      console.log('New substory added:', newSubStory);
      setNewSubStoryApi({
        name: '',
        description: '',
        priority: PriorityMongo.LOW,
        story: activeStoryApi!,
        expected_time: TimeMongo.THREE,
        state: StateMongo.TODO,
        created: Date.now(),
        start: Date.now(),
        end: Date.now(),
        owner: undefined,
      });
      setSubStoriesApi((prevSubStories) => (Array.isArray(prevSubStories) ? [...prevSubStories, newSubStory] : [newSubStory]));
      assignTask(newSubStoryApi.name, newSubStoryApi.owner, newSubStoryApi.priority)
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  const handleStoryChangeApi = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'owner') {
      setNewStoryApi(prevState => ({ ...prevState, [name]: Number(value) }));
    } else {
      setNewStoryApi(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleEditSubStoryChangeApi = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editingSubStoryApi) {
      const { name, value } = e.target;
      setEditingSubStoryApi({ ...editingSubStoryApi, [name]: name === 'owner' || name === 'state' || name === 'priority' ? String(value) : value });
    }
  };
  
  const handleSubStoryChangeApi = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setNewSubStoryApi(prevState => ({ ...prevState, [name]: value }));
  };

  const handleDeleteStoryApi = async (storyId) => {
    try {
      await axios.post(`http://localhost:3000/delete_story/${storyId}`);
      setStoriesApi((prevStories) => {
        if (!Array.isArray(prevStories)) {
          console.error('prevStories is not an array:', prevStories);
          return [];
        }
        return prevStories.filter(story => story.id !== storyId);
      });
      console.log(token)
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleDeleteSubStoryApi = async (substoryId) => {
    try {
      await axios.post(`http://localhost:3000/delete_substory/${substoryId}`);
      setSubStoriesApi((prevSubStories) => {
        if (!Array.isArray(prevSubStories)) {
          console.error('prevStories is not an array:', prevSubStories);
          return [];
        }
        return prevSubStories.filter(substory => substory.id !== substoryId);
      });
      console.log(token)
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleEditStory = (story: StoryMongo) => {
    setEditingStoryApi(story);
  };

  const getUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get_users');
      await setUsersApi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get_projects');
      setProjectsApi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getStoryData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get_stories');
      setStoriesApi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubStoryData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get_substories');
      setSubStoriesApi(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
    getProjectData();
    getStoryData();
    getSubStoryData();
  }, []);

  useEffect(() => {
    setSubStories(SubStoryService.get_substories_by_id(activeStory!));
    setUsers(UserService.get_users());
    setNoAdminUsers(UserService.get_users_no_admin());
  }, [activeStory]);

  const handleEditSubStory = (subStory: SubStoryMongo) => {
    setEditingSubStoryApi(subStory);
  };

  const handleShowAllStoriesApi = () => {
    setActiveStoryApi(null);
    StoryService.clear_active();
  }

  const handleDeleteNotification = (index: number) => {
    notificationService.delete(index);
  };

  const handleLogin = (token: string) => {
    setToken(token);
    console.log(token, typeof(token));
    const expiration = new Date().getTime() + 10 * 1000 * 6 * 60;

    localStorage.setItem('token', JSON.stringify(token));
    localStorage.setItem('tokenExpiration', expiration.toString());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const assignTask = (taskName: string, userName: number, priority: PriorityMongo) => {
    const notification: Notification = {
      title: `Nowe zadanie: ${taskName}`,
      message: `Dodano nowe zadanie: ${taskName}}`,
      date: new Date().toLocaleString('pl-PL').toString(),
      priority: priority,
      read: false,
    };
    if (priority !== PriorityMongo.LOW) setActiveNotification(notification)
    notificationService.send(notification);
  };

  const assignStory = (taskName: string, userName: number, priority: PriorityMongo) => {
    const notification: Notification = {
      title: `Dodano nowe story ${taskName}`,
      message: ` ${taskName}`,
      date: new Date().toLocaleString('pl-PL').toString(),
      priority: priority,
      read: false,
    };
    if (priority !== PriorityMongo.LOW) setActiveNotification(notification)
    notificationService.send(notification);
  };

  const handleNotificationPopUpOff = () => {
    setActiveNotification(null);
  }
  
  const handleNotificationViewOn = () => {
    setNotificationView(true);
  }

  const handleNotificationViewOff = () => {
    setNotificationView(false);
  }

  const handleRegister = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  return (
    <div className="w-screen flex flex-col overflow-hidden min-h-20 items-center">
      <header className="w-screen h-20 flex border-b-4 border-white position-absolute justify-around items-center">
        <p className="text-5xl font-bold text-white text-center antialiased">ManageMe</p>
        {isAuthenticated === true &&
        <div className='flex justify-around items-center'>
          {activeNotification && 
            <div className='absolute bg-crimson z-50 align-center top-20 w-3/12 p-2 left-0 min-w-32'>
              <p className='text-white bg-crimson text-2xl'>{activeNotification.title}</p>
              <p className='text-white bg-crimson text-xl'>Priorytet: {activeNotification.priority}</p>
              <div className='bg-crimson flex justify-end mr-5'>
                <button onClick={handleNotificationPopUpOff}>Wyjdź</button>
              </div>
            </div>
          }
          <button onClick={handleNotificationViewOn} className='text-crimson mr-10 text-2xl'>{unreadCount}n.p.</button>
          <h1 className='text-white align-center justify-center text-2xl'>Zalogowany jako: <span className='text-crimson'>{token.username}</span></h1>
          <button className='bg-crimson ml-5 mb-2 align-center justify-center hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full' onClick={handleLogout}>Wyloguj</button>
          {notificationView === true &&
            <div className='edit-field z-50'>
              <h2>Wszystkie Powiadomienia</h2>
              <ul className='mt-5'>
                {notifications.map((notification, index) => (
                  <li className="mt-5 border-b-2 border-white" key={index}>
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <p>{notification.date}</p>
                    <p>Priorytet: {notification.priority}</p>
                    <p>Przeczytane: {notification.read.toString()}</p>
                    <div className='flex justify-around mt-3 mb-5'>
                      <button className='text-crimson' onClick={() => notificationService.mark_as_read(index)}>Oznacz jako przeczytane</button>
                      <button className='text-crimson' onClick={() => handleDeleteNotification(index)}>Usuń</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex width-max justify-center mt-5">
                <button onClick={handleNotificationViewOff} className='text-crimson'>Wyjdź</button>
              </div>
          </div>
          }
        </div>
        }
      </header>
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
    {activeProjectApi === null ? (
      <>
        <div className="project-info">
          <input className="mt-4 text-white" type="text" name="title" placeholder="Nazwa projektu" value={newProject.title} onChange={handleInputChange} />
          <input className="mt-3 text-white" type="text" name="description" placeholder="Opis projektu" value={newProject.description} onChange={handleInputChange} />
          <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 color-white rounded-full" onClick={handleAddProjectApi}>Dodaj projekt</button>
        </div>
        {editingProjectApi && (
          <div className="edit-field">
            <h2 className="text-white text-3xl">Edit Project</h2>
            <input className="mt-4 text-white border-2" type="text" name="title" placeholder="Project Name" value={editingProjectApi.title} onChange={handleEditInputChange} />
            <input className="mt-4 text-white border-2" type="text" name="description" placeholder="Project Description" value={editingProjectApi.description} onChange={handleEditInputChange} />
            <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full" onClick={handleUpdateProjectApi}>Edytuj</button>
            <button className="bg-crimson hover:bg-blue-700 text-white mt-3 font-bold py-2 px-4 rounded-full" onClick={() => setEditingProjectApi(null)}>Cofnij</button>
          </div>
        )}
        <div className="grid grid-cols-3 w-6/12 gap-6 mt-10">
         {projectsApi.length === 0 ? (
          <p>No projects available</p>
        ) : (
          projectsApi.map(project => (
            <div className="flex flex-col w-100 border-2 border-white p-5" key={project.id}>
              <h2 className='text-white text-2xl'>{project.title}</h2>
              <p className='text-white text-lg'>{project.description}</p>
              <button className="bg-crimson hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5" onClick={() => handleEditProjectApi(project)}>Edytuj</button>
              <button className="bg-crimson hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={() => handleDeleteProjectApi(project.id)}>Usuń</button>
              <button className="bg-green hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={() => handleSetActiveProjectApi(project.id)}>Aktywuj</button>
            </div>
          ))
        )}
        </div>  
      </>
    ) : (
      <div>
        {projectsApi.filter(project => project.id === activeProjectApi).map(project => (
          <React.Fragment key={project.id}>
            <div className="flex justify-center items-center flex-col mt-4">
              <h3 className="text-white text-4xl mt-2">{project.title}</h3>
              <p className="text-white text-1xl mt-2">{project.description}</p>
              <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={handleShowAllProjects}>Wróć do projetków</button>
            </div>
            {newStoryApi && (
              <div className="flex justify-center items-center flex-col">
                <div className="flex justify-center items-center flex-col">
                  <input className="mt-4 text-white border-2 p-2" type="text" name="name" placeholder="Story title" value={newStoryApi.name} onChange={handleStoryChangeApi}/>
                  <textarea className="mt-4 text-white border-2 p-2" name="description" placeholder="Story description" value={newStoryApi.description} onChange={handleStoryChangeApi}/>
                  <div>
                    <select className="mt-4 text-white" value={newStoryApi.state} name="state" onChange={handleStoryChangeApi}>
                      <option className="mt-4 text-white border-2" value={State.TODO}>Todo</option>
                      <option className="mt-4 text-white border-2" value={State.DOING}>Doing</option>
                      <option className="mt-4 text-white border-2" value={State.DONE}>Done</option>
                    </select>
                    <select className="mt-4 text-white ml-5" value={newStoryApi.priority} name="priority" onChange={handleStoryChangeApi}>
                      <option className="mt-4 text-white border-2" value={Priority.HIGH}>High</option>
                      <option className="mt-4 text-white border-2" value={Priority.MEDIUM}>Medium</option>
                      <option className="mt-4 text-white border-2" value={Priority.LOW}>Low</option>
                    </select>
                  </div>
                  <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 text-white rounded-full" onClick={handleAddStoryApi}>Dodaj funkcjonalność</button>
                </div>
              </div>
            )}

            {activeStoryApi === null ? (
              <React.Fragment key={project.id}>
              <div className="flex justify-center mt-10 mb-20">
                <div className="flex flex-col text-white border-2 p-5 max-w-96 min-w-96">
                  <h2 className="text-3xl">TODO</h2>
                  {storiesApi.filter(story => story.state === StateMongo.TODO && story.project === project.id).map(story => (
                      <div key={story.id} className="mt-5">
                        <h3 className="text-xl">{story.name}</h3>
                        <p>{story.description}</p>
                        <p>Stan: {story.state}</p>
                        <p>Priorytet: {story.priority}</p>
                        <p>Użytkownik: {get_username_by_id_api(story.owner)}</p>
                        <div className="flex justify-around">
                          <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                          <button className="text-crimson" onClick={() => handleSetActiveStoryApi(story.id)}>Idź do zadań</button>
                          <button className="text-crimson" onClick={() => handleDeleteStoryApi(story.id)}>Usuń</button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex flex-col text-white border-2 p-5 ml-5 max-w-96 min-w-96">
                  <h2 className="text-3xl">DOING</h2>
                  {storiesApi.filter(story => story.state === StateMongo.DOING && story.project === project.id).map(story => (
                      <div key={story.id} className="mt-5">
                        <h3 className="text-xl">{story.name}</h3>
                        <p>{story.description}</p>
                        <p>Stan: {story.state}</p>
                        <p>Priorytet: {story.priority}</p>
                        <p>Użytkownik: {get_username_by_id_api(story.owner)}</p>
                        <div className="flex justify-around">
                          <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                          <button className="text-crimson" onClick={() => handleSetActiveStoryApi(story.id)}>Idź do zadań</button>
                          <button className="text-crimson" onClick={() => handleDeleteStoryApi(story.id)}>Usuń</button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex flex-col text-white border-2 p-5 ml-5 max-w-96 min-w-96">
                  <h2 className="text-3xl">DONE</h2>
                  {storiesApi.filter(story => story.state === StateMongo.DONE && story.project === project.id).map(story => (
                      <div key={story.id} className="mt-5">
                        <h3 className="text-xl">{story.name}</h3>
                        <p>{story.description}</p>
                        <p>Stan: {story.state}</p>
                        <p>Priorytet: {story.priority}</p>
                        <p>Użytkownik: {get_username_by_id_api(story.owner)}</p>
                        <div className="flex justify-around">
                          <button className="text-crimson" onClick={() => handleEditStory(story)}>Edytuj</button>
                          <button className="text-crimson" onClick={() => handleSetActiveStoryApi(story.id)}>Idź do zadań</button>
                          <button className="text-crimson" onClick={() => handleDeleteStoryApi(story.id)}>Usuń</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              </React.Fragment>
            ) : (
              <div className="main-div-sub">
                {storiesApi.filter(story => story.id === activeStoryApi).map(story => (
                    <React.Fragment key={story.id}>
                      <div>
                        <div className="flex flex-col justify-center items-center">
                          <h2 className="text-2xl mt-5 text-white">
                            Zadanie dla <b className="text-crimson">{story.name}</b>
                          </h2>
                        </div>
                        <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5" onClick={handleShowAllStoriesApi}>Pokaż wszystkie fukcjonalności</button>
                      </div>
                      {newSubStory && (
                        <div className="flex flex-col max-w-96 min-w-96 mt-7">
                          <h2 className="text-2xl text-white">Dodaj zadanie</h2>
                          <input className="mt-4 text-white border-2 p-2" type="text" name="name" placeholder="SubStory Name" value={newSubStoryApi.name} onChange={handleSubStoryChangeApi}/>
                          <textarea className="mt-4 text-white border-2 p-2" name="description" placeholder="SubStory Description" value={newSubStoryApi.description} onChange={handleSubStoryChangeApi}/>
                          <div className="flex justify-around items-center mt-5 text-white">
                            <select name="priority" value={newSubStoryApi.priority} onChange={handleSubStoryChangeApi}>
                              <option value={Priority.HIGH}>High</option>
                              <option value={Priority.MEDIUM}>Medium</option>
                              <option value={Priority.LOW}>Low</option>
                            </select>
                            <select value={newSubStoryApi.expected_time} name="expected_time" onChange={handleSubStoryChangeApi}>
                              <option value={Time.THREE}>3h</option>
                              <option value={Time.FIVE}>5h</option>
                              <option value={Time.EIGHT}>8h</option>
                            </select>
                          </div>
                          <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full mt-5" onClick={handleAddSubStoryApi}>Dodaj zadanie</button>
                        </div>
                      )}
                      <div className="flex justify-center mt-10">
                        <div className="flex flex-col text-white border-2 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">TODO</h2>
                          {substoriesApi.filter(substory => substory.state === StateMongo.TODO && substory.story == story.id).map(substory => (
                              <div key={substory.id} className="mt-5">
                                <h3 className="text-xl font-bold">{substory.name}</h3>
                                <p>{substory.description}</p>
                                <p>Stan: {substory.state}</p>
                                <p>Priorytet: {substory.priority}</p>
                                <p>Utworzono: {StoryService.convert_num_to_string(substory.created)}</p>
                                <p>Przewidywany czas: {substory.expected_time}</p>
                                <p>Użytkownik: {get_username_by_id_api(substory.owner)}</p>
                                <div className="flex justify-around">
                                  <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                  <button className="text-crimson" onClick={() => handleDeleteSubStoryApi(substory.id)}>Usuń</button>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="flex flex-col text-white border-2 ml-5 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">DOING</h2>
                          {substoriesApi.filter(substory => substory.state === StateMongo.DOING && substory.story == story.id).map(substory => (
                              <div key={substory.id} className="mt-5">
                                <h3 className="text-xl font-bold">{substory.name}</h3>
                                <p>{substory.description}</p>
                                <p>Stan: {substory.state}</p>
                                <p><b>Priorytet:</b> {substory.priority}</p>
                                <p><b>Utworzono:</b> {StoryService.convert_num_to_string(substory.created)}</p>
                                <p><b>Przewidywany czas:</b> {substory.expected_time}</p>
                                <p><b>Rozpoczęto:</b> {StoryService.convert_num_to_string(substory.start)}</p>
                                <p><b>Użytkownik:</b> {get_username_by_id_api(substory.owner)}</p>
                                <div className="flex justify-around">
                                  <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                  <button className="text-crimson" onClick={() => handleDeleteSubStoryApi(substory.id)}>Usuń</button>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="flex flex-col text-white border-2 ml-5 p-5 max-w-96 min-w-96">
                          <h2 className="text-3xl">DONE</h2>
                          {substoriesApi.filter(substory => substory.state === StateMongo.DONE && substory.story == story.id).map(substory => (
                              <div key={substory.id} className="mt-5">
                                <h3 className="text-xl font-bold">{substory.name}</h3>
                                <p>{substory.description}</p>
                                <p>Stan: {substory.state}</p>
                                <p>Priorytet: {substory.priority}</p>
                                <p>Utworzono: {StoryService.convert_num_to_string(substory.created)}</p>
                                <p>Przewidywany czas: {substory.expected_time}</p>
                                <p><b>Rozpoczęto:</b> {StoryService.convert_num_to_string(substory.start)}</p>
                                <p><b>Zakończono:</b> {StoryService.convert_num_to_string(substory.end)}</p>
                                <p>Użytkownik: {get_username_by_id_api(substory.owner)}</p>
                                <div className="flex justify-around">
                                  <button className="text-crimson" onClick={() => handleEditSubStory(substory)}>Edytuj</button>
                                  <button className="text-crimson" onClick={() => handleDeleteSubStoryApi(substory.id)}>Usuń</button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      {editingSubStoryApi && (
                        <div className="edit-field">
                          <h2>Edytuj podzadanie</h2>
                          <div className='flex flex-col text-white'>
                            <input className='p-2 border-white border-2' type="text" name="name" placeholder='Nazwa' value={editingSubStoryApi.name} onChange={handleEditSubStoryChangeApi} />
                            <textarea className='p-2 mt-2 border-white border-2' name="description" placeholder="Opis" value={editingSubStoryApi.description} onChange={handleEditSubStoryChangeApi}/>
                          </div>
                          <div>
                            <select name="owner" value={editingSubStoryApi.owner} onChange={handleEditSubStoryChangeApi}>
                              {usersApi.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.username}
                                </option>
                              ))}
                            </select>
                            <select name="state" value={editingSubStoryApi.state} onChange={handleEditSubStoryChangeApi}>
                              <option value={State.TODO}>Todo</option>
                              <option value={State.DOING}>Doing</option>
                              <option value={State.DONE}>Done</option>
                            </select>
                          </div>
                          <div className='flex w-full justify-around'>
                            <button className='text-crimson' onClick={handleUpdateSubStoryApi}>Edytuj</button>
                            <button className='text-crimson'  onClick={() => setEditingSubStoryApi(null)}>Cofnij</button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            )}
          </React.Fragment>
        ))}
          {editingStoryApi && (
            <div className="edit-field">
              <h2 className="text-3xl">Edytuj funkcjonalność</h2>
              <input className="border-2 p-2 mt-8" type="text" name="name" placeholder='Nazwa' value={editingStoryApi.name} onChange={handleEditStoryChange} />
              <textarea className='max-w-96 min-h-44 min-w-96 border-2 p-2' placeholder='Opis' name="description" value={editingStoryApi.description} onChange={handleEditStoryChange} />
              <div>
                <select name="state" value={editingStoryApi.state} onChange={handleEditStoryChange}>
                  <option value={State.TODO}>Todo</option>
                  <option value={State.DOING}>Doing</option>
                  <option value={State.DONE}>Done</option>
                </select>
                <select className='ml-5' name="priority" value={editingStoryApi.priority} onChange={handleEditStoryChange}>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.LOW}>Low</option>
                </select>
                <select className='ml-5' name="owner" value={editingStoryApi.owner} onChange={handleEditStoryChange}>
                  {usersApi.map(user => (
                    <option key={user.id} value={user.id.toString()}>{user.username}</option>
                  ))}
                </select>
              </div>
              <p>Utworzono: {StoryService.convert_num_to_string(editingStoryApi.created)}</p>
              <div>
                <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full" onClick={handleUpdateStoryApi}>Edytuj</button>
                <button className="bg-crimson mt-2 hover:bg-blue-700 text-white mt-1 font-bold py-2 px-4 rounded-full ml-5" onClick={() => setEditingStoryApi(null)}>Cofnij</button>
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