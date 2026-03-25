import { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { UserSelector } from './components/UserSelector';
import { PostsList } from './components/PostsList';
import { Loader } from './components/Loader';
import { User } from './types/User';
import { Post } from './types/Post';
import { getUsers } from './api/users';
import { getPostsByUserId } from './api/posts';

export const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
  };

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setIsLoadingPosts(true);
    setPostsError(false);
    setPosts([]);
    setSelectedPost(null);

    getPostsByUserId(selectedUser.id)
      .then(setPosts)
      .catch(() => setPostsError(true))
      .finally(() => setIsLoadingPosts(false));
  }, [selectedUser]);

  const handlePostSelect = (post: Post) => {
    setSelectedPost(prev => (prev?.id === post.id ? null : post));
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

          {/* <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              'Sidebar--open',
            )}
          >
            <div className="tile is-child box is-success ">
              <PostDetails />
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
};
