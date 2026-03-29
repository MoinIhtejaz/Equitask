import { Member } from "@/types";

interface AvatarProps {
  member: Member;
  size?: "sm" | "md";
}

export function Avatar({ member, size = "md" }: AvatarProps) {
  const dimension = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      title={member.name}
      className={`${dimension} inline-flex items-center justify-center rounded-full border border-white/50 font-semibold text-white shadow-[0_10px_24px_-16px_rgba(17,20,26,0.8)]`}
      style={{ backgroundColor: member.avatarColor }}
    >
      {member.name.slice(0, 2).toUpperCase()}
    </div>
  );
}
