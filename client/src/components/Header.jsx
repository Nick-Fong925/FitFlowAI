import FitFlow from "../assets/HeaderAssets/FitFlowLogo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white py-7 max-w-6xl mx-auto">
      <nav className="container mx-auto flex items-center justify-between flex-1">
        <Link to="/">
          <img src={FitFlow} alt="logo" className="h-16" />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link
              className="text-black font-bold hover:text-gray-200"
              to="/login"
            >
              LOGIN
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;