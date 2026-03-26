import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

export const getCommentsByPostId = (postId: number) =>
  client.get<Comment[]>(`/comments?postId=${postId}`);
