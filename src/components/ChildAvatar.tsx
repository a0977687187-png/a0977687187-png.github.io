interface ChildAvatarProps {
  avatar: string;
  size?: number;
}

// 孩子頭像可以是 emoji 字串，或家長上傳圖片轉出的 base64 dataURL。
export function ChildAvatar({ avatar, size = 56 }: ChildAvatarProps) {
  const isImage = avatar.startsWith("data:image");
  return (
    <div
      className="avatar-circle"
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {isImage ? (
        <img src={avatar} alt="頭像" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: size * 0.55 }}>{avatar}</span>
      )}
    </div>
  );
}
