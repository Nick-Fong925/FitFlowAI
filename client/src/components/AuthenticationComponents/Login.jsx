import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md font-bold hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
            >
              Login
            </button>
            <p className="text-sm text-gray-600">
              Dont have an account?{' '}
              <Link to="/Register" className="font-bold text-gray-400">
                Register
             </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
