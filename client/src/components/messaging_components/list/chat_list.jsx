const ChatList = ({ setActiveUser }) => {
  const users = ["John", "Mary", "Paul"];
  return (
    <div className="list-group">
      {users.map((u) => (
        <button key={u} className="list-group-item" onClick={() => setActiveUser(u)}>
          {u}
        </button>
      ))}
    </div>
  );
}


export default ChatList