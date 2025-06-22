// Sistema de autenticación para BOA Tracking

export interface User {
  email: string;
  password: string;
  role: 'admin' | 'public';
  name: string;
}

// Usuarios predefinidos - SOLO estos usuarios pueden acceder
export const USERS: User[] = [
  {
    email: 'huancarodrigo1@gmail.com',
    password: 'Admi123@',
    role: 'admin',
    name: 'Administrador'
  },
  {
    email: 'marckstar1@gmail.com',
    password: 'User123@',
    role: 'public',
    name: 'Usuario Público'
  }
];

// Función de autenticación
export const authenticateUser = (email: string, password: string): User | null => {
  const user = USERS.find(u => u.email === email && u.password === password);
  return user || null;
};

// Verificar si es admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Verificar si es público
export const isPublic = (user: User | null): boolean => {
  return user?.role === 'public';
};

// Verificar si un email ya existe (para bloquear registros)
export const isEmailRegistered = (email: string): boolean => {
  return USERS.some(user => user.email === email);
};

// Función para validar credenciales de admin
export const validateAdminCredentials = (email: string, password: string): boolean => {
  const user = USERS.find(u => u.email === email && u.password === password);
  return user?.role === 'admin';
};

const API_URL = 'http://192.168.100.16:3000/api/users';

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data && data.role) {
      return data; // { id, name, email, role }
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function registerUser({ name, email, password, role = 'public' }: { name: string, email: string, password: string, role?: string }) {
  try {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (res.ok && data && data.id) {
      return data;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

// Función para solicitar recuperación de contraseña
export async function requestPasswordReset(email: string) {
  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Error al solicitar recuperación' };
    }
  } catch (e) {
    return { success: false, error: 'Error de conexión' };
  }
}

// Función para resetear contraseña con token
export async function resetPassword(token: string, newPassword: string) {
  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Error al resetear contraseña' };
    }
  } catch (e) {
    return { success: false, error: 'Error de conexión' };
  }
}

// Función para verificar token de recuperación
export async function verifyResetToken(token: string) {
  try {
    const res = await fetch(`${API_URL}/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Token inválido' };
    }
  } catch (e) {
    return { success: false, error: 'Error de conexión' };
  }
} 