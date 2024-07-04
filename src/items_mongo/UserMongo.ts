export enum UserRole {
  ADMIN = 'ADMIN',
  DEVOPS = 'DEVOPS',
  DEVELOPER = 'DEVELOPER',
}

export interface UserMongo {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}
