// Simple localStorage-based auth for demo purposes
export const DEMO_CREDENTIALS = [
  { username: 'admin', password: 'cricket123' },
  { username: 'demo', password: 'demo123' },
];

export function login(username: string, password: string): boolean {
  const match = DEMO_CREDENTIALS.find(
    (c) => c.username === username && c.password === password
  );
  if (match) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cricketiq_user', username);
      localStorage.setItem('cricketiq_auth', 'true');
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cricketiq_user');
    localStorage.removeItem('cricketiq_auth');
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cricketiq_auth') === 'true';
}

export function getUser(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('cricketiq_user') || '';
}
