import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';

function App() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [month, setMonth] = useState('');
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/pagination', {
          params: {
            page: currentPage,
            perPage: itemsPerPage,
            month: month,
          },
        });
        setData(response.data.products);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError('Failed to fetch data from the server.');
      }
      setLoading(false);
    };

    fetchData();
  }, [currentPage, month]);


  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setCurrentPage(1); 
  };


  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="App">
      <h1>Product Transactions</h1>

  
      <div className="month-filter">
        <label htmlFor="month">Select Month: </label>
        <select id="month" value={month} onChange={handleMonthChange}>
          <option value="">All</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

   
      {error && <div className="error">{error}</div>}


      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
         
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Description</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Date of Sale</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.price}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.sold ? 'Yes' : 'No'}</td>
                    <td>{new Date(item.dateOfSale).toLocaleDateString()}</td>
                    <td>
                      <img src={item.image} alt={item.title} width="50" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No data available</td>
                </tr>
              )}
            </tbody>
          </table>


          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>

 
          <Statistics month={month} />


          <BarChart month={month} />
        </>
      )}
    </div>
  );
}

export default App;