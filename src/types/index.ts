export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  interests: string[];
  status: UserStatus;
  isDeleted: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface IRegisterResponse {
  email: string;
  fullName: string;
  needsVerification: boolean;
}

export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  interests?: string[];
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IResendOtpPayload {
  email: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IVerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface IResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface INoteAuthor {
  _id: string;
  fullName: string;
  email: string;
}

export interface INote {
  _id: string;
  title: string;
  content: string;
  userId: string | INoteAuthor;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateNotePayload {
  title: string;
  content: string;
}

export interface IUpdateNotePayload {
  title?: string;
  content?: string;
}

export interface IPostAuthor {
  _id: string;
  fullName: string;
  email: string;
}

export interface IPost {
  _id: string;
  title: string;
  content: string;
  userId: string | IPostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePostPayload {
  title: string;
  content: string;
}

export interface IInterestsGroup {
  interest: string;
  count: number;
  users: Array<{
    _id: string;
    fullName: string;
    email: string;
  }>;
}

export interface IUserWithPosts extends IUser {
  posts: IPost[];
}

export interface ICreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  interests?: string[];
}

export interface IUpdateUserPayload {
  fullName?: string;
  interests?: string[];
  status?: UserStatus;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: IPaginationMeta;
  data: T;
}
