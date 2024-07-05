import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { StoryMongo } from '../items_mongo/StoryMongo'
import UserServiceMongo from '../items_mongo/UserServiceMongo';
import ProjectServiceMongo from '../items_mongo/ProjectServiceMongo';
import StoryServiceMongo from '../items_mongo/StoryServiceMongo';
import SubStoryServiceMongo from '../items_mongo/SubStoryServiceMongo';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const tokenSecret = process.env.TOKEN_SECRET || 'your_jwt_secret';

app.use(cors());
app.use(express.json());

interface User {
  username: string;
  password: string;
  role?: string;
}

interface Project {
  title: string;
  description: string;
}

app.get('/', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization']
});

app.post('/token', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as User;
    const user = await UserServiceMongo.get_user_by_name(username);
    if (user && user.password === password) {
      const token = generateToken(360);
      const refreshToken = generateToken(3600);
      const userid = (await UserServiceMongo.get_user_by_name(username)).id
      localStorage.setItem('token', token);
      res.status(200).send({ token, refreshToken, username, userid, password  });
    } else {
      res.status(401).send('Invalid login');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { usernameR, passwordR, password2R, roleR } = req.body;

    if (passwordR !== password2R) {
      res.status(401).send('Passwords do not match');
      return;
    }

    const user = await UserServiceMongo.add_user(usernameR, passwordR, roleR);

    if (user) {
      const token = generateToken(60);
      const refreshToken = generateToken(3600);
      res.status(200).send({ token, refreshToken });
    } else {
      res.status(409).send('User already exists');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get("/get_users", async (req: Request, res: Response) => {
  try {
    const users = await UserServiceMongo.get_users();
    res.json(users);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.get("/get_projects", async (req: Request, res: Response) => {
  try {
    const projects = await ProjectServiceMongo.get_projects();
    if (!projects) {
      return res.status(404).json({ message: "No projects found" });
    }
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/add_project', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body as Project;

    const project = await ProjectServiceMongo.add_project(title, description);
    if (project) {
      res.status(200).json({ project });
    } else {
      res.status(500).send('Error adding project');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.post('/update_project/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description } = req.body;

    console.log('Received update request for project:', projectId);
    console.log('Updating with new title:', title);
    console.log('Updating with new descr:', description);

    const updatedProject = await ProjectServiceMongo.update_project(projectId, title, description);

    console.log(updatedProject)

    if (updatedProject) {
      console.log('Project updated successfully:', updatedProject);
      res.status(200).json({ project: updatedProject });
    } else {
      console.log('Project not found or update failed');
      res.status(404).json({ error: 'Project not found or update failed' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/delete_project/:id', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    const deleted = await ProjectServiceMongo.delete_project(projectId);
    if (deleted) {
      res.status(200).json({ deleted });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

let activeProjectId: string | null = null;

app.post('/set_active_project/:id', (req, res) => {
  const { id } = req.params;
  activeProjectId = id;
  const token = generateToken(360);
  const refreshToken = generateToken(3600);
  res.status(200).send({ token, refreshToken, activeProjectId });
});

app.get('/get_active_project', (req, res) => {
  res.json({ success: true, activeProjectId });
});

app.post('/add_story', async (req: Request, res: Response) => {
  try {
    const { name, description, priority, project, created, state, owner } = req.body;
    console.log(owner, project, state, priority)
    const addedStory = await StoryServiceMongo.add_story(name, description, priority, project, created, state, owner);

    if (addedStory) {
      res.status(200).json({ story: addedStory });
    } else {
      res.status(500).send('Error adding story');
    }
  } catch (error) {
    console.error('Error adding story:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/delete_story/:id', async (req: Request, res: Response) => {
  try {
    const storyId = req.params.id;

    const deleted = await StoryServiceMongo.delete_story(storyId);
    if (deleted) {
      res.status(200).json({ deleted });
    } else {
      res.status(404).send('Story not found');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.post('/update_story/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    const { name, description, state, priority, owner } = req.body;

    console.log('Received update request for story:', storyId);
    console.log('Updating with new title:', name);
    console.log('Updating with new description:', description);
    console.log('Updating with new state:', state);
    console.log('Updating with new priority:', priority);

    const updatedStory = await StoryServiceMongo.update_story(storyId, name, description, state, priority, owner);

    if (updatedStory) {
      console.log('Project updated successfully:', updatedStory);
      res.status(200).json({ project: updatedStory });
    } else {
      console.log('Project not found or update failed');
      res.status(404).json({ error: 'Project not found or update failed' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

let activeStoryId: string | null = null;

app.post('/set_active_story/:id', (req, res) => {
  const { id } = req.params;
  activeProjectId = id;
  const token = generateToken(360);
  const refreshToken = generateToken(3600);
  res.status(200).send({ token, refreshToken, activeStoryId });
});

app.get("/get_stories", async (req: Request, res: Response) => {
  try {
    const stories = await StoryServiceMongo.get_stories();
    if (!stories) {
      return res.status(404).json({ message: "No projects found" });
    }
    res.json(stories);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/add_substory', async (req: Request, res: Response) => {
  try {
    const { name, description, priority, story, expected_time, state, created, start, end, owner } = req.body;
    console.log("server side: ", owner, story, state, priority, expected_time)
    const addedSubStory = await SubStoryServiceMongo.add_substory(name, description, priority, story, expected_time, state, created, start, end, owner);

    if (addedSubStory) {
      res.status(200).json({ substory: addedSubStory });
    } else {
      res.status(500).send('Error adding substory');
    }
  } catch (error) {
    console.error('Error adding substory:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/delete_substory/:id', async (req: Request, res: Response) => {
  try {
    const substoryId = req.params.id;

    const deleted = await SubStoryServiceMongo.delete_substory(substoryId);
    if (deleted) {
      res.status(200).json({ deleted });
    } else {
      res.status(404).send('Story not found');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

app.post('/update_substory/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    let { name, description, state, priority, start, end, owner } = req.body;

    console.log('Received update request for substory:', storyId);
    console.log('Updating with new title:', name);
    console.log('Updating with new description:', description);
    console.log('Updating with new state:', state);
    console.log('Updating with new priority:', priority);

    const updatedSubStory = await SubStoryServiceMongo.update_substory(storyId, name, description, state, priority, start, end, owner);

    if (updatedSubStory) {
      console.log('Project updated successfully:', updatedSubStory);
      res.status(200).json({ updatedSubStory });
    } else {
      console.log('Project not found or update failed');
      res.status(404).json({ error: 'Project not found or update failed' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/get_substories", async (req: Request, res: Response) => {
  try {
    const substories = await SubStoryServiceMongo.get_substories();
    if (!substories) {
      return res.status(404).json({ message: "No projects found" });
    }
    res.json(substories);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post('/refreshToken', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  // Implement refresh token logic here
});

app.get('/protected/:id/:delay?', verifyToken, (req: Request, res: Response) => {
  const { id, delay } = req.params;
  setTimeout(() => {
    res.status(200).send(`Protected endpoint ${id}`);
  }, delay ? +delay : 0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



function generateToken(expirationInSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expirationInSeconds;
  const token = jwt.sign({ exp }, tokenSecret, { algorithm: 'HS256' });
  return token;
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token)
    res.sendStatus(403);

  jwt.verify(token, tokenSecret, (err, user) => {
    if (err) {
      return res.status(401).send(err.message);
    }
    (req as any).user = user;
    next();
  });
}
