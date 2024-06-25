import { User, UserRole } from '../models/User';

class UserService {

    private localStorageKey = "users"

    private users: User[] = [
      new User(1, 'admin', 'admin', UserRole.ADMIN),
      new User(2, 'devops', 'devops', UserRole.DEVOPS),
      new User(3, 'developer', 'developer', UserRole.DEVELOPER),
    ];

    private nextId = 4;

    get_users(): User[] {
      const users = localStorage.getItem(this.localStorageKey);
      return users ? JSON.parse(users) as User[] : [];
    }

    add_user(username: string, password: string, role: UserRole): User {
      const user = new User(this.nextId++, username, password, role);
      const users = this.get_users();
      for (let i = 0; i < users.length; i++)
        if (user.username === users[i].username)
          return;
      users.push(user);
      localStorage.setItem(this.localStorageKey, JSON.stringify(users));
      return user;
    }

    get_user_by_name(username: string): User | undefined {
      return this.users.find(user => user.username === username);
    }

    get_users_no_admin(): User[] {
      const usersNoAdmin = []
      for (let i = 0; i < this.users.length - 1; i++)
        usersNoAdmin[i] = this.users[i + 1]     
      return usersNoAdmin
    }
}

export default new UserService();
