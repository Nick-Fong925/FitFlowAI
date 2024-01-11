import { useState } from 'react';

//API Key for OpenAI: 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

const TrackEating = () => {
  const [mealLogs, setMealLogs] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({
    date: new Date().toLocaleDateString(),
    items: [],
  });
  const [newFoodItem, setNewFoodItem] = useState({
    food: '',
    quantity: 0,
    calories: 0,
  });

  const addMealLog = () => {
    setMealLogs([...mealLogs, currentMeal]);
    setCurrentMeal({
      date: new Date().toLocaleDateString(),
      items: [],
    });
    setNewFoodItem({
      food: '',
      quantity: 0,
      calories: 0,
    });
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
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
        <input
          type="number"
          value={newFoodItem.quantity}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, quantity: parseInt(e.target.value) })}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Calories:</label>
        <input
          type="number"
          value={newFoodItem.calories}
          onChange={(e) => setNewFoodItem({ ...newFoodItem, calories: parseInt(e.target.value) })}
          className="border p-2 w-full"
        />
      </div>
      <button
        onClick={addFoodItem}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Add Food Item
      </button>

      {/* Display current meal log */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Current Meal Log - {currentMeal.date}</h2>
        <ul>
          {currentMeal.items.map((item, index) => (
            <li key={index}>
              {item.food} - {item.quantity} servings, {item.calories} calories
            </li>
          ))}
        </ul>
      </div>

      {/* Button to save meal log */}
      <button
        onClick={addMealLog}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Save Meal Log
      </button>

      {/* Display all meal logs */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">All Meal Logs</h2>
        <ul>
          {mealLogs.map((log, index) => (
            <li key={index}>
              {log.date} - {log.items.length} items
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrackEating;
