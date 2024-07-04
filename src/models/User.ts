import { ObjectId } from 'mongodb'

enum UserRole {
  ADMIN = 'admin',
  DEVOPS = 'devops',
  DEVELOPER = 'developer'
}

class User {
  id: number;
  username: string;
  password: string;
  role: UserRole;

  constructor(id: number, username: string, password: string, role: UserRole) {
    this.id = id;
    this.username= username;
    this.password = password;
    this.role = role
  }
}

export { User, UserRole };