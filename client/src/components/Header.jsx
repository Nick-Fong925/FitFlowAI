import FitFlow from "../assets/HeaderAssets/FitFlowLogo.png";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { selectActualUserName } from "../selectors/nameSelector";
import { useEffect } from 'react';

function Header() {
  const userName = useSelector(selectActualUserName);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: 'SET_DISPLAYED_NAME', payload: userName || 'Login' });
  }, [dispatch, userName]);

  const handleLogout = () => {
    dispatch({ type: 'CLEAR_USER_ID' });
    dispatch({ type: 'CLEAR_USER_NAME' });
    dispatch({ type: 'SET_DISPLAYED_NAME', payload: 'Login' });
  };

  return (
    <header className="bg-white py-7 flex justify-center items-center">
      <div className="max-w-7xl flex justify-between w-full px-10">
        <Link to="/" className="flex items-center">
          <img src={FitFlow} alt="logo" className="h-12 md:h-14 lg:h-16" />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              {userName ? (
                <button
                  className="text-black font-bold hover:text-gray-200 text-s username-style border-2 rounded-lg p-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <Link
                  className="text-black font-bold hover:text-gray-200 md:text-s login-style"
                  to="/login"
                >
                  <span className="text-black font-bold hover:text-gray-200 text-s">
                    {userName || 'Login'}
                  </span>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;