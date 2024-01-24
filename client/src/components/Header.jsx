import FitFlow from "../assets/HeaderAssets/FitFlowLogo.png";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectActualUserName } from "../selectors/nameSelector";
import { useEffect, useState } from 'react';

function Header() {
  const userName = useSelector(selectActualUserName);
  const [displayedName, setDisplayedName] = useState('Login');

  useEffect(() => {

    setDisplayedName(userName || 'Login');
  }, [userName]);

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
                <span
                  className={`text-black font-bold hover:text-gray-200 md:text-lg ${userName ? 'username-style' : 'login-style'}`}
                >
                  {displayedName}
                </span>
              </Link>
            </li>
    
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;