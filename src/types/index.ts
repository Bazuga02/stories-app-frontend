export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type StoryStatus = "DRAFT" | "PUBLISHED";

export interface StoryAuthor {
  id: string;
  name: string;
  email?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId?: string;
  author?: StoryAuthor;
  status: StoryStatus;
  likesCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  storyId: string;
  userId?: string;
  user?: Pick<StoryAuthor, "id" | "name">;
  createdAt?: string;
}

export interface PaginatedStories {
  items: Story[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorBody {
  message?: string | string[];
  /** Spring validation errors (list of field messages). */
  details?: string[] | Record<string, unknown>;
  error?: string;
  statusCode?: number;
}
