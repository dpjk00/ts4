import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import UserService from '../services/UserService'; // Adjust the path as per your project structure

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
const tokenSecret = "asdfjhadsjklfhadjkghfdkjghsfd" as string; // Ensure this matches your .env variable name
let refreshToken: string;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GET TEST');
});

// Endpoint to authenticate and get JWT token
app.post('/token', (req, res) => {
  const { username, password } = req.body;
  console.log("test123")
  // Find user by username
  const user = UserService.get_user_by_name(username);

  // Check if user exists and password matches
  if (user && user.password === password) {
    const token = generateToken(360); // 60 seconds expiration
    refreshToken = generateToken(3600); // 1 hour expiration for refresh token
    res.status(200).send({ token, refreshToken });
  } else {
    res.status(401).send('Login zły');
  }
});

app.post('/register', (req, res) => {
  const { username, password, password2, role } = req.body;

  if (password !== password2) {
    res.status(401).send('Hasła nie są takie same');
    return;
  }

  console.log("witaj")
  const user = UserService.get_user_by_name(username);
  //const user = UserService.add_user(username, password, role);

  // Check if user exists and password matches
  if (user && user.password === password) {
    const token = generateToken(60); // 60 seconds expiration
    refreshToken = generateToken(3600); // 1 hour expiration for refresh token
    res.status(200).send({ token, refreshToken });
  } else {
    res.status(401).send('Złe dane');
  }
});

// Endpoint to refresh JWT token
app.post('/refreshToken', (req, res) => {
  const { refreshToken: refreshTokenFromPost } = req.body;

  if (refreshToken !== refreshTokenFromPost) {
    return res.status(400).send('Bad refresh token!');
  }

  const token = generateToken(60); // 60 seconds expiration
  refreshToken = generateToken(3600); // 1 hour expiration for refresh token

  setTimeout(() => {
    res.status(200).send({ token, refreshToken });
  }, 3000);
});

// Endpoint for protected routes (example)
app.get('/protected/:id/:delay?', verifyToken, (req, res) => {
  const { id, delay } = req.params;
  setTimeout(() => {
    res.status(200).send(`Protected endpoint ${id}`);
  }, delay ? +delay : 0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function generateToken(expirationInSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + expirationInSeconds;
  const token = jwt.sign({ exp, foo: 'bar' }, tokenSecret as string, { algorithm: 'HS256' });
  return token;
}

function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, tokenSecret as string, (err: any, user: any) => {
    if (err) {
      console.log(err);
      return res.status(401).send(err.message);
    }
    req.user = user;
    next();
  });
}
