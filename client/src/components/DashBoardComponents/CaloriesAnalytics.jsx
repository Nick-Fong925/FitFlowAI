import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectActualUserID } from "../../selectors/userSelectors.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

function Analytics() {
  const actualUserID = useSelector(selectActualUserID);
  const [caloriesAnalyticData, setCaloriesAnalyticData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('allTime');

  const fetchMealAnalyticsData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/getMealAnalytics?userID=${actualUserID}`);
      const sortedData = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setCaloriesAnalyticData(sortedData);
    } catch (error) {
      console.error('Error fetching meal analytics data:', error);
    }
  };

  const processMealDataForChart = (mealData) => {
    const aggregatedData = mealData.reduce((result, item) => {
      const date = item.date.split('T')[0];
      if (!result[date]) {
        result[date] = { date, totalCalories: 0 };
      }
      result[date].totalCalories += item.calories;
      return result;
    }, {});

    return Object.values(aggregatedData);
  };

  useEffect(() => {
    fetchMealAnalyticsData();
  }, [actualUserID, selectedDateRange]);

  const filterDataByDateRange = (data, range) => {
    const currentDate = new Date(); // Initial date
    switch (range) {
      case 'last3Days':
        return data.filter(
          (item) => new Date(item.date) >= new Date(new Date(currentDate).setDate(currentDate.getDate() - 3))
        );
      case 'last7Days':
        return data.filter(
          (item) => new Date(item.date) >= new Date(new Date(currentDate).setDate(currentDate.getDate() - 7))
        );
      case 'last30Days':
        return data.filter(
          (item) => new Date(item.date) >= new Date(new Date(currentDate).setDate(currentDate.getDate() - 30))
        );
      default:
        return data;
    }
  };

  const chartMealData = processMealDataForChart(
    filterDataByDateRange(caloriesAnalyticData, selectedDateRange)
  );

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-teal-500 ml-20 mb-5">Total Calories</h2>
      </div>
      <div className="ml-10 mb-4">
        <label className="ml-10 mr-2 text-teal-500 font-semibold">Select Date Range:</label>
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="border text-xs rounded-md font-semibold p-1" 
        >
          <option value="allTime" className="font-semibold p-1 text-xs">All Time</option>
          <option value="last3Days" className="font-semibold p-1 text-xs">Last 3 Days</option>
          <option value="last7Days" className="font-semibold p-1 text-xs">Last 7 Days</option>
          <option value="last30Days" className="font-semibold p-1 text-xs">Last 30 Days</option>
        </select>
      </div>
      <div className="ml-10">
        <LineChart width={600} height={300} data={chartMealData}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="date" className="text-sm font-semibold text-teal-500"/>
          <YAxis className="text-sm font-semibold text-teal-500"/>
          <Tooltip/>
          <Line type="monotone" dataKey="totalCalories" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}

export default Analytics;