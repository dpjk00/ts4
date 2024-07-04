import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import UserServiceMongo from '../items_mongo/UserServiceMongo';
import ProjectServiceMongo from '../items_mongo/ProjectServiceMongo';
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

app.post('/token', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as User;
    const user = await UserServiceMongo.get_user_by_name(username);
    if (user && user.password === password) {
      const token = generateToken(360);
      const refreshToken = generateToken(3600);
      res.status(200).send({ token, refreshToken });
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
    console.log('Updating with new description:', description);

    const updatedProject = await ProjectServiceMongo.update_project(projectId, title, description);

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
  res.json({ success: true, activeProjectId });
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

function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, tokenSecret, (err, user) => {
    if (err) {
      return res.status(401).send(err.message);
    }
    (req as any).user = user;
    next();
  });
}
