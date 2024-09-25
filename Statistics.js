import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Statistics({ month }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/stats', {
          params: { month }
        });
        setStats(response.data);
      } catch (error) {
        setError('Failed to fetch statistics.');
      }
      setLoading(false);
    };

    if (month) {
      fetchStatistics();
    }
  }, [month]);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Sales Statistics for {month ? `Month ${month}` : 'All Months'}</h2>
      {stats ? (
        <table>
          <thead>
            <tr>
              <th>Total Sale Amount</th>
              <th>Total Sold Items</th>
              <th>Total Unsold Items</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{stats.totalSaleAmount}</td>
              <td>{stats.totalSoldItems}</td>
              <td>{stats.totalUnSoldItems}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div>No statistics available.</div>
      )}
    </div>
  );
}

export default Statistics;
