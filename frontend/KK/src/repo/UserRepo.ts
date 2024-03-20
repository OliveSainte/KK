import { User } from "firebase/auth";

class UserRepository {
  private static instance: UserRepository;
  private user: User = {} as User

  private constructor() {}

  static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async saveUser(user: User): Promise<void> {
    this.user = user
  }

  async getUser(): Promise<User> {
    return this.user
  }
}

export const userRepository = UserRepository.getInstance();
