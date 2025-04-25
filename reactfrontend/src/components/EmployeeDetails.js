import React from 'react';

const EmployeeDetails = ({ employeeDetails, onClose }) => {
  if (!employeeDetails || !employeeDetails.employee) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Employee Details</h2>
            <button onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <p>No employee details available</p>
          </div>
        </div>
      </div>
    );
  }

  const { employee, directHires } = employeeDetails;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Employee Details</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="employee-details">
            <p><strong>ID:</strong> {employee.id}</p>
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Position:</strong> {employee.position}</p>
            <p><strong>Hire Date:</strong> {employee.hireDate}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`status ${employee.active ? 'active' : 'inactive'}`}>
                {employee.active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          
          <div className="direct-reports">
            <h3>Direct Reports ({directHires ? directHires.length : 0})</h3>
            {directHires && directHires.length > 0 ? (
              <ul>
                {directHires.map(report => (
                  <li key={report.id}>
                    <strong>{report.name}</strong> - {report.position}
                    <span className={`status ${report.active ? 'active' : 'inactive'}`}>
                      {report.active ? ' (Active)' : ' (Inactive)'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No direct reports</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
