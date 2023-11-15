import Hero from "../components/Hero"
import { Link } from "react-router-dom";


const Home = () => {
  return (
    <>
    <div className="flex items-center justify-center">
    <div className="max-w-6xl">
      <Hero />
      <div>
      <div className="flex items-center justify-center">
        <Link to="/Dashboard">
      <button className="bg-blue-500 text-white px-6 py-3 font-bold rounded-full">
        Start Finding Your Flow
    </button>
     </Link>
        </div>
      </div>
      </div>
      </div>
    </>

  );
};

export default Home;
