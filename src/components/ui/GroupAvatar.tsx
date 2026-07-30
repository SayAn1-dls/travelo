import { cn } from "@/utils/cn";

interface Member {
  name: string;
  avatar?: string;
  color?: string;
}

interface GroupAvatarProps {
  members: Member[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = ["#4a9eff", "#10d9a0", "#f0b429", "#ff4757", "#a78bfa", "#f97316"];

export function GroupAvatar({ members, max = 4, size = "md", className }: GroupAvatarProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((member, i) => (
        <div
          key={member.name}
          className={cn(
            "rounded-full border-2 border-[#05051c] flex items-center justify-center font-bold text-white ring-1",
            sizes[size]
          )}
          style={{
            background: member.color ?? colors[i % colors.length],
            ringColor: (member.color ?? colors[i % colors.length]) + "33",
          }}
          title={member.name}
        >
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            member.name[0].toUpperCase()
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full border-2 border-[#05051c] flex items-center justify-center font-bold bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)]",
            sizes[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
