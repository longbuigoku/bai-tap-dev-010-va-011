export interface AuthState {
  isLoggedIn: boolean;
  user: {
    username: string;
    name?: string;
    distribution?: string;
    phone?: string;
    email?: string;
  } | null;
}

export interface SignInFormData {
  username: string;
  password: string;
}

export interface SignUpFormData {
  salesName: string;
  agency: string;
  phone: string;
  email: string;
  agreePolicy: boolean;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

