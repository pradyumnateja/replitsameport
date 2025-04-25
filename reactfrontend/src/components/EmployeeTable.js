import React from 'react';

const EmployeeTable = ({ employees }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="employee-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="no-data">
                No employees found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="employee-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Hire Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td style={{ fontWeight: 'bold' }}>{employee.name}</td>
              <td>{employee.position}</td>
              <td>{employee.hireDate}</td>
              <td>
                <span className={`status ${employee.active ? 'active' : 'inactive'}`}>
                  {employee.active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
