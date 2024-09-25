import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart({ month }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/barchart', {
          params: { month }
        });
        const data = response.data;
        const labels = data.map((d) => d._id);
        const values = data.map((d) => d.count);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Number of Items Sold',
              data: values,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch bar chart data:', error);
      }
    };

    if (month) {
      fetchBarChartData();
    }
  }, [month]);

  return (
    <div>
      <h2>Bar Chart for Price Ranges</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                type: 'category', 
              },
              y: {
                type: 'linear', 
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <div>Loading chart...</div>
      )}
    </div>
  );
}

export default BarChart;
