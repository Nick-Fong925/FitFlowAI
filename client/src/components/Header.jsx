import FitFlow from "../assets/HeaderAssets/FitFlowLogo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white py-7 flex items-center">
      <nav className="container mx-auto flex items-center flex-1 ml-10 mr-10">
        <Link to="/">
          <img src={FitFlow} alt="logo" className="h-12 md:h-14 lg:h-16" />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link
              className="text-black font-bold hover:text-gray-200 mr-10 md:text-2xl"
              to="/login"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;