import FitFlow from "../assets/HeaderAssets/FitFlowLogo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white py-7 flex justify-center items-center">
      <div className="max-w-7xl flex justify-between w-full px-10">
        <Link to="/" className="flex items-center">
          <img src={FitFlow} alt="logo" className="h-12 md:h-14 lg:h-16" />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                className="text-black font-bold hover:text-gray-200 md:text-lg"
                to="/login"
              >
                Login
              </Link>
            </li>
            {/* Add more navigation items as needed */}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;