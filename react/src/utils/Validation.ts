export const validation = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password: string): boolean => {
    return password.length >= 6;
  },

  username: (username: string): boolean => {
    return username.length >= 3;
  }
};