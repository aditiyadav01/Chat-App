const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div
      onClick={handleFunction}
      className="inline-flex items-center gap-1 px-2 py-1 m-1 mb-2 text-xs font-medium text-white bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700 transition"
    >
      {user.name}
      {admin === user._id && <span className="ml-1">(Admin)</span>}
      <span className="ml-1 text-sm">✕</span>
    </div>
  );
};

export default UserBadgeItem;
