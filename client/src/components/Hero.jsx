import heroimg from "../assets/HomePageAssets/HeroImage.png";
function hero() {
  return (
    <div className="relative">
      <img src={heroimg} alt="heroimg" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-6xl font-bold">
        Optimize Fitness. Stay Consistent. Find Your Flow.
      </div>
    </div>
  );
}

export default hero;
