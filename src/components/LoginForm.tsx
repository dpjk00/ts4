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
      onLogin(response.data);
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="mt-10">
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <input className="border-2 border-white text-white p-2 mt-2" type="text" name="username" placeholder="Login" value={username} onChange={handleChange}/>
        </div>
        <div>
          <input className="border-2 border-white text-white p-2 mt-2" type="password" name="password" placeholder="Hasło" value={password} onChange={handleChange}/>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-crimson mt-3 text-white font-bold py-2 px-4 rounded-full">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
