// Register.jsx
import { Link } from "react-router-dom";

function Register() {
	const handleSubmit = async (event) => {
		event.preventDefault();

		const email = event.target.email.value;
		const password = event.target.password.value;
		const confirmPassword = event.target.confirmPassword.value;

		// Check if passwords match
		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		try {
			// Send a request to the Go backend to register the user
			const response = await fetch("http://localhost:8080/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				alert("Registration successful!");
				event.target.email.value = "";
				event.target.password.value = "";
				event.target.confirmPassword.value = "";
				window.location.href = "/login";
			} else {
				alert("Registration failed");
			}
		} catch (error) {
			console.error("Error during registration:", error);
			alert("Registration failed");
		}

	};

	return (
		<div className="flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h2 className="text-2xl font-semibold mb-4">Register</h2>
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
					<div className="mb-4">
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							className="mt-1 p-2 w-full border rounded-md"
							placeholder="Confirm your password"
						/>
					</div>
					<div className="flex justify-between items-center">
						<button
							type="submit"
							className="bg-blue-500 text-white py-2 px-4 rounded-md font-bold hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
						>
							Register
						</button>
						<p className="text-sm text-gray-600">
							Already have an account?{' '}
							<Link to="/Login" className="font-bold text-gray-400">
								Login
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Register;
