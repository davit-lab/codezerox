import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center no-underline cursor-pointer group gap-2.5">
      <img src={logoImg} alt="CodeZero Academy" className="w-9 h-9 rounded-lg object-contain" />
      <span className="text-lg font-bold tracking-tight text-foreground">​Codezero </span>
    </Link>);

};

export default Logo;