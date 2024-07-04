import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/token', {
        username: username,
        password: password,
      });
      onLogin(response.data.token);
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <input type="text" name="username" placeholder="Login" value={username} onChange={handleChange} className="text-white p-2"/>
        </div>
        <div>
          <input type="password" name="password" placeholder="Hasło" value={password} onChange={handleChange} className="text-white p-2 mt-2"/>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-crimson mt-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
