import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { UserRole } from '../models/User';

interface RegisterFormProps {
  onRegister: (token: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [usernameR, setUsernameR] = useState('');
  const [passwordR, setPasswordR] = useState('');
  const [password2R, setPassword2R] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      onRegister(response.data.token);
    } catch (error) {
      setError('Invalid credentials asdkjfh');
    }
  };



  return (
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
  );
};

export default RegisterForm;
