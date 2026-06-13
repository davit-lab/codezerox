import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("w-full max-w-[1440px] mx-auto px-8", className)}>
      {children}
    </div>
  );
};

export default Container;
