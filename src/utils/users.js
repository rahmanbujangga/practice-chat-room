const users = [];

//addUser, removeUser, getUser, getUserInRoom

exports.addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return { error: "Username and room are required!" };
  }

  const existingUSer = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUSer) {
    return { error: "Username is in use!" };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

exports.removeUser = (id) => {
  const index = users.findIndex((u) => u.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

exports.getUser = (id) => {
  const index = users.findIndex((u) => u.id === id);

  if (index !== -1) {
    return users[index];
  }

  return undefined;
};

exports.getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((u) => u.room === room);
};
