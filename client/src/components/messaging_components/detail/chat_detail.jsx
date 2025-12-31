const ChatDetail = ({ activeUser }) => {
  return (
    <div className="p-3">
      <h6>User Info</h6>
      <p>{activeUser}</p>
    </div>
  );
};

export default ChatDetail;
