import { useEffect, useState } from 'react';
import classNames from 'classnames';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { UserSelector } from './components/UserSelector';
import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { Loader } from './components/Loader';
import { User } from './types/User';
import { Post } from './types/Post';
import { Comment, CommentData } from './types/Comment';
import { getUsers } from './api/users';
import { getPostsByUserId } from './api/posts';
import {
  getCommentsByPostId,
  createComment,
  deleteComment,
} from './api/comments';

export const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(false);

  useEffect(() => {
    setIsLoadingUsers(true);
    setUsersError(false);

    getUsers()
      .then(setUsers)
      .catch(() => setUsersError(true))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsLoadingPosts(true);
    setPostsError(false);
    setPosts([]);
    setSelectedPost(null);

    getPostsByUserId(user.id)
      .then(setPosts)
      .catch(() => setPostsError(true))
      .finally(() => setIsLoadingPosts(false));
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPost(prev => (prev?.id === post.id ? null : post));
    // Selecting a new post - load its comments
    setIsLoadingComments(true);
    setCommentsError(false);
    setComments([]);

    getCommentsByPostId(post.id)
      .then(setComments)
      .catch(() => setCommentsError(true))
      .finally(() => setIsLoadingComments(false));
  };

  const handleCommentDelete = (commentId: number) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));

    deleteComment(commentId)
      .catch(() => setCommentsError(true))
      .finally(() => setIsLoadingComments(false));
  };

  const handleCommentSubmit = (data: CommentData): Promise<void> => {
    return createComment({ ...data, postId: selectedPost!.id, id: 0 }).then(
      newComment => {
        setComments(prev => [...prev, newComment]);
      },
    );
  };

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  users={users}
                  selectedUser={selectedUser}
                  onUserSelect={handleUserSelect}
                  isLoading={isLoadingUsers}
                />

                {usersError && (
                  <p className="has-text-danger">Failed to load users</p>
                )}
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUser && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {selectedUser && isLoadingPosts && <Loader />}

                {selectedUser && !isLoadingPosts && postsError && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    Something went wrong!
                  </div>
                )}

                {selectedUser &&
                  !isLoadingPosts &&
                  !postsError &&
                  posts.length === 0 && (
                    <div
                      className="notification is-warning"
                      data-cy="NoPostsYet"
                    >
                      No posts yet
                    </div>
                  )}

                {selectedUser &&
                  !isLoadingPosts &&
                  !postsError &&
                  posts.length > 0 && (
                    <PostsList
                      posts={posts}
                      selectedPostId={selectedPost?.id ?? null}
                      onPostSelect={handlePostSelect}
                    />
                  )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              { 'Sidebar--open': selectedPost !== null },
            )}
          >
            <div className="tile is-child box is-success ">
              {selectedPost && (
                <PostDetails
                  post={selectedPost}
                  comments={comments}
                  isLoadingComments={isLoadingComments}
                  commentsError={commentsError}
                  onCommentDelete={handleCommentDelete}
                  onCommentSubmit={handleCommentSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
