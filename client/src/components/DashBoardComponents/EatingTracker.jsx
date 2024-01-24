import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectActualUserID } from "../../selectors/userSelectors.js"

const TrackEating = () => {

  const actualUserID = useSelector(selectActualUserID);

  const [mealLogs, setMealLogs] = useState([]);

  const [currentMeal, setCurrentMeal] = useState({
    userID: actualUserID, 
    date: new Date().toLocaleDateString(),
    items: [],
  });

  const [newFoodItem, setNewFoodItem] = useState({
    food: '',
    quantity: 0,
    calories: 0,
  });

  const [loading, setLoading] = useState(false);

  
    const fetchMealLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/getAllMealLogs?userID=${actualUserID}`);
      setMealLogs(response.data);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
    }
  };

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  }

  const addMealLog = async () => {

    setLoading(true);

    try {

      await saveMealLogToServer(currentMeal);

      setMealLogs([...mealLogs, currentMeal]);

      setCurrentMeal({
        userID: actualUserID, 
        date: new Date().toLocaleDateString(),
        items: [],
      });

      setNewFoodItem({
        food: '',
        quantity: 0,
        calories: 0,
      });

      await fetchMealLogs();

    } catch (error) {

      console.error('Error saving meal log:', error);

    } finally {

      setLoading(false);

    }

  };

  const addFoodItem = () => {

    setCurrentMeal({
      ...currentMeal,
      items: [...currentMeal.items, newFoodItem],
    });

    setNewFoodItem({
      food: '',
      quantity: 0,
      calories: 0,
    });

  };


  const saveMealLogToServer = async (mealLog) => {

    try {

      console.log(mealLog)

      await axios.post('http://localhost:8080/saveMealLog', mealLog);

      console.log('Meal log saved successfully!');

      await fetchMealLogs();

    } catch (error) {

      console.error('Error saving meal log to server:', error);

      throw error;

    }
  };

  
  useEffect(() => {
    fetchMealLogs();
  }, []);

  
 

  return (
  
    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">Track Eating</h1>

      {/* Form to add new food item */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Food:</label>
        <input
          type="text"
          value={newFoodItem.food}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, food: e.target.value })}
          className="border-2 p-2 w-full rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
        <input
          type="number"
          value={newFoodItem.quantity}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, quantity: parseInt(e.target.value) })}
          className="border-2 p-2 w-full rounded-lg text-s"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Calories:</label>
        <input
          type="number"
          value={newFoodItem.calories}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, calories: parseInt(e.target.value) })}
          className="border-2 p-2 w-full rounded-lg text-s"
        />
      </div>
      <button
        onClick={addFoodItem}
        className="bg-teal-500 text-white font-semibold text-sm py-2 px-4 rounded hover:bg-teal-600"
      >
        Add Food Item
      </button>

      {/* Display current meal log */}
      <div className="border-4 border-teal-600 bg-teal-50 rounded-xl p-4 max-w-xs font-semibold text-xs mt-10 mb-10 ">
        <h2 className="text-lg font-bold mb-4">{formatDate(currentMeal.date)}</h2>
        <ul >
          {currentMeal.items.map((item, index) => (
            <li key={index}>
              {item.food}: {item.quantity} servings, {item.calories} calories
            </li>
          ))}
        </ul>
      </div>

      {/* Button to save meal log */}
      <button
        onClick={addMealLog}
        className="bg-teal-500 text-white font-semibold text-sm py-2 px-4 rounded hover:bg-teal-600"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Meal Log'}
      </button>

      {/* Display all meal logs */}
     
      <div className="mt-8">
  <h2 className="text-xl font-bold mb-4">All Meal Logs</h2>
  {mealLogs && mealLogs.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 xl:grid-cols-5">
      {mealLogs.map((log) => (
        <div key={log.entryID} className="border-4 border-teal-600 bg-teal-50 rounded-xl p-4 max-w-xs font-semibold text-xs">
           <p className="mb-3 font-bold text-slate-500 text-m"> {formatDate(log.date)}</p>
          <ul>
            {log.items.map((item, index) => (
              <li key={index}>
                <span className="font-bold">{item.food}:</span> {item.quantity} servings, {item.calories} calories
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <p>No meal logs available.</p>
  )}
</div>
     </div>

  );
};

export default TrackEating;
