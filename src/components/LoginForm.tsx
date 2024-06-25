import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { UserRole } from '../models/User';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

interface RegisterFormProps {
  onRegister: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [usernameR, setUsernameR] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [password2R, setPassword2R] = useState('');
  const [role, setRole] = useState('');

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

  const handleChangeRegister = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'usernameR') setUsernameR(value);
    if (name === 'passwordR') setPasswordR(value);
    if (name === 'password2R') setPassword2R(value);
    if (name === 'role') setRole(role)
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', {
        usernameR: usernameR,
        password: passwordR,
        password2: password2R,
        role: role
      });
      onLogin(response.data.token);
    } catch (error) {
      setError('Invalid credentials asdkjfh');
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
      <div>
      <form onSubmit={handleRegister} className="register-form mt-20">
        <div>
          <input type="text" name="usernameR" placeholder="Login" value={usernameR} onChange={handleChangeRegister} className="text-white p-2"/>
        </div>
        <div>
          <input type="password" name="passwordR" placeholder="Hasło" value={passwordR} onChange={handleChangeRegister} className="text-white p-2 mt-2"/>
        </div>
        <div>
          <input type="password" name="password2R" placeholder="Powtórz hasło" value={password2R} onChange={handleChangeRegister} className="text-white p-2 mt-2"/>
        </div>
        <div>
        <select className="mt-4 text-white" onChange={handleChangeRegister} name="role" id="">
          <option className="mt-4 text-white border-2" value={UserRole.DEVELOPER}>DEVELOPER</option>
          <option className="mt-4 text-white border-2" value={UserRole.DEVOPS}>DEVOPS</option>
        </select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-crimson mt-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Rejestracja</button>
      </form>
    </div>
    </div>
  );
};

export default LoginForm;
