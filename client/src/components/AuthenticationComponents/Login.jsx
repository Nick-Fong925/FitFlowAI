import { Link } from "react-router-dom";
import { useDispatch, useStore} from 'react-redux';


function Login() {

  const dispatch = useDispatch();
  const store = useStore();

  async function handleSubmit(event) {
    event.preventDefault();
  
    const email = event.target.email.value;
    const password = event.target.password.value;
  
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Response from backend:", data);
        console.log("UserID:", data.userID);
        console.log("UserName:", data.email);


        dispatch({ type: 'SET_USER_ID', payload: data.userID });
        console.log('Action dispatched:', { type: 'SET_USER_ID', payload: data.userID  });

        dispatch({ type: 'SET_USER_NAME', payload: data.email });
        console.log('Action dispatched:', { type: 'SET_USER_NAME', payload: data.email });
  
        // Log the updated Redux state to the console
        console.log("Updated Redux State:", store.getState());
  
        alert("Login successful!");
        
      } else {
        const errorText = await response.text();
        alert(`Login failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed");
    }
  }
  

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg md:shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
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
