import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectActualUserID } from "../../selectors/userSelectors.js"

function Analytics() {
  const actualUserID = useSelector(selectActualUserID);
  const [caloriesAnalyticData, setCaloriesAnalyticData] = useState([]);
  const [workoutAnalyticData, setWorkoutAnalyticData] = useState([]);

  const fetchMealAnalyticsData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/getMealAnalytics?userID=${actualUserID}`);
      setCaloriesAnalyticData(response.data);
      console.log("Fetched Meal Logs:", response.data);
      console.log("analytic data", caloriesAnalyticData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const fetchWokoutAnalyticsData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/getWorkoutAnalytics?userID=${actualUserID}`);
      setWorkoutAnalyticData(response.data);
      console.log("Fetched Workout Logs:", response.data);
      console.log("analytic data", workoutAnalyticData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };


  useEffect(() => {
    fetchMealAnalyticsData();
  }, [actualUserID]);

  
  useEffect(() => {
    fetchWokoutAnalyticsData();
  }, [actualUserID]);

  return (
    <div>
      
    </div>
  );
}

export default Analytics;