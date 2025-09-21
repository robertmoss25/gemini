// src/App.js (React Frontend)

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import './App.css'; // Assuming you use the default styling

// --- 1. Global Filter Component for Search ---
const GlobalFilter = ({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) => {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = (e) => {
    setValue(e.target.value);
    setGlobalFilter(e.target.value || undefined);
  };

  return (
    <span>
      Search: {' '}
      <input
        value={value || ''}
        onChange={onChange}
        placeholder={`${count} records...`}
        style={{
          fontSize: '1.1rem',
          border: '0',
        }}
      />
    </span>
  );
};

// --- 2. Main App Component ---
function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the columns for react-table
  // NOTE: These headers must match the column names returned by your stored procedure
  const columns = useMemo(
    () => [
      // Example columns (adjust these to match your SQL columns)
      { Header: 'Name', accessor: 'Name' },
      { Header: 'Age', accessor: 'Age' },
      { Header: 'Occupation', accessor: 'Occupation' }, 
    ],
    []
  );

  // Fetch data from the Express API
  useEffect(() => {
    axios.get('http://host.docker.internal:3000/api/customers') // <--- Express Backend API Endpoint
    //axios.get('http://localhost:3000/api/customers') // <--- Express Backend API Endpoint
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to fetch customer data.");
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  // Setup the table instance using react-table hooks
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter, // Enables global search
    useSortBy       // Enables sorting
  );

  if (loading) return <div>Loading customer data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="App">
      <h1>SQL Customer Data</h1>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                // Add sorting props to each header
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {/* Add a sort indicator */}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
