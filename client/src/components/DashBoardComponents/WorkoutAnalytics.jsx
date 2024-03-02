import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectActualUserID } from "../../selectors/userSelectors.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

function WorkoutAnalytics() {
  const actualUserID = useSelector(selectActualUserID);
  const [workoutAnalyticData, setWorkoutAnalyticData] = useState([]);
  const [selectedDateRangeSets, setSelectedDateRangeSets] = useState('allTime');
  const [selectedDateRangeExercises, setSelectedDateRangeExercises] = useState('allTime');
  const [selectedDateRangeReps, setSelectedDateRangeReps] = useState('allTime');

  const fetchWorkoutAnalyticsData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/getAllWorkoutLogs?userID=${actualUserID}`);
      const sortedData = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setWorkoutAnalyticData(sortedData);
    } catch (error) {
      console.error('Error fetching workout analytics data:', error);
    }
  };

  const processWorkoutDataForChart = (workoutData) => {
    const aggregatedData = workoutData.reduce((result, item) => {
      const date = item.date.split('T')[0];
      if (!result[date]) {
        result[date] = { date, totalSets: 0, totalExercises: 0, totalReps: 0 };
      }
      result[date].totalSets += item.entries.reduce((total, entry) => total + entry.sets, 0);
      result[date].totalExercises += item.entries.length;
      result[date].totalReps += item.entries.reduce((total, entry) => total + entry.reps, 0);
      return result;
    }, {});

    return Object.values(aggregatedData);
  };

  useEffect(() => {
    fetchWorkoutAnalyticsData();
  }, [actualUserID, selectedDateRangeSets, selectedDateRangeExercises, selectedDateRangeReps]);

  const filterDataByDateRange = (data, range) => {
    const currentDate = new Date();
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

  const chartDataSets = processWorkoutDataForChart(
    filterDataByDateRange(workoutAnalyticData, selectedDateRangeSets)
  );

  const chartDataExercises = processWorkoutDataForChart(
    filterDataByDateRange(workoutAnalyticData, selectedDateRangeExercises)
  );

  const chartDataReps = processWorkoutDataForChart(
    filterDataByDateRange(workoutAnalyticData, selectedDateRangeReps)
  );

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-teal-500 ml-20 mb-5">Workout Analytics - Total Sets</h2>
      </div>
      <div className="ml-10 mb-4">
        <label className="ml-10 mr-2 text-teal-500 font-semibold">Select Date Range:</label>
        <select
          value={selectedDateRangeSets}
          onChange={(e) => setSelectedDateRangeSets(e.target.value)}
          className="border text-xs rounded-md font-semibold p-1"
        >
          <option value="allTime" className="font-semibold p-1 text-xs">All Time</option>
          <option value="last3Days" className="font-semibold p-1 text-xs">Last 3 Days</option>
          <option value="last7Days" className="font-semibold p-1 text-xs">Last 7 Days</option>
          <option value="last30Days" className="font-semibold p-1 text-xs">Last 30 Days</option>
        </select>
      </div>
      <div className="ml-10">
        <LineChart width={600} height={300} data={chartDataSets}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="date" className="text-sm font-semibold text-teal-500"/>
          <YAxis className="text-sm font-semibold text-teal-500"/>
          <Tooltip/>
          <Line type="monotone" dataKey="totalSets" stroke="#8884d8" name="Total Sets" />
        </LineChart>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-teal-500 ml-20 mb-5">Workout Analytics - Total Exercises</h2>
      </div>
      <div className="ml-10 mb-4">
        <label className="ml-10 mr-2 text-teal-500 font-semibold">Select Date Range:</label>
        <select
          value={selectedDateRangeExercises}
          onChange={(e) => setSelectedDateRangeExercises(e.target.value)}
          className="border text-xs rounded-md font-semibold p-1"
        >
          <option value="allTime" className="font-semibold p-1 text-xs">All Time</option>
          <option value="last3Days" className="font-semibold p-1 text-xs">Last 3 Days</option>
          <option value="last7Days" className="font-semibold p-1 text-xs">Last 7 Days</option>
          <option value="last30Days" className="font-semibold p-1 text-xs">Last 30 Days</option>
        </select>
      </div>
      <div className="ml-10">
        <LineChart width={600} height={300} data={chartDataExercises}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="date" className="text-sm font-semibold text-teal-500"/>
          <YAxis className="text-sm font-semibold text-teal-500"/>
          <Tooltip/>
          <Line type="monotone" dataKey="totalExercises" stroke="#82ca9d" name="Total Exercises" />
        </LineChart>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-teal-500 ml-20 mb-5">Workout Analytics - Total Reps</h2>
      </div>
      <div className="ml-10 mb-4">
        <label className="ml-10 mr-2 text-teal-500 font-semibold">Select Date Range:</label>
        <select
          value={selectedDateRangeReps}
          onChange={(e) => setSelectedDateRangeReps(e.target.value)}
          className="border text-xs rounded-md font-semibold p-1"
        >
          <option value="allTime" className="font-semibold p-1 text-xs">All Time</option>
          <option value="last3Days" className="font-semibold p-1 text-xs">Last 3 Days</option>
          <option value="last7Days" className="font-semibold p-1 text-xs">Last 7 Days</option>
          <option value="last30Days" className="font-semibold p-1 text-xs">Last 30 Days</option>
        </select>
      </div>
      <div className="ml-10">
        <LineChart width={600} height={300} data={chartDataReps}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="date" className="text-sm font-semibold text-teal-500"/>
          <YAxis className="text-sm font-semibold text-teal-500"/>
          <Tooltip/>
          <Line type="monotone" dataKey="totalReps" stroke="#ffc658" name="Total Reps" />
        </LineChart>
      </div>
    </div>
  );
}

export default WorkoutAnalytics;
