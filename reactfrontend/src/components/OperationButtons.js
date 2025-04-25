import React, { useState } from 'react';
import './OperationButtons.css';

const OperationButtons = ({ 
  onDateSearch, 
  onStatusChange, 
  onSort,
  onViewDetails,
  onDelete,
  onAddEmployee,
  employees 
}) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showStatusControl, setShowStatusControl] = useState(false);
  const [showDetailsControl, setShowDetailsControl] = useState(false);
  const [showDeleteControl, setShowDeleteControl] = useState(false);
  const [showAddControl, setShowAddControl] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [detailsId, setDetailsId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [notification, setNotification] = useState(null);

  const getMaxDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const handleDateSearch = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showNotification('Please enter both start and end dates', 'error');
      return;
    }

    const maxDate = getMaxDate();
    if (startDate > maxDate || endDate > maxDate) {
      showNotification('Selected dates cannot be in the future', 'error');
      return;
    }

    if (endDate < startDate) {
      showNotification('End date must be after start date', 'error');
      return;
    }

    onDateSearch(startDate, endDate);
    setShowDateFilter(false);
  };

  const handleStatusChange = async (action) => {
    if (!employeeId) {
      showNotification('Please enter an employee ID', 'error');
      return;
    }

    const id = parseInt(employeeId, 10);
    const employee = employees.find(e => e.id === id);
    
    if (!employee) {
      showNotification('Employee not found', 'error');
      return;
    }

    if (action === 'activate' && employee.active) {
      showNotification('Employee is already active', 'warning');
      return;
    }

    if (action === 'deactivate' && !employee.active) {
      showNotification('Employee is already inactive', 'warning');
      return;
    }

    try {
      await onStatusChange(id, action === 'deactivate');
      showNotification(
        `Employee ${employee.name} successfully ${action === 'activate' ? 'activated' : 'deactivated'}`,
        'success'
      );
      setEmployeeId('');
      setShowStatusControl(false);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="operations-container">
      <div className="operation-buttons">
        <button 
          className={`operation-btn ${showDateFilter ? 'active' : ''}`}
          onClick={() => {
            setShowDateFilter(!showDateFilter);
            setShowStatusControl(false);
          }}
        >
          <i className="fas fa-calendar-alt"></i>
          Search by Hire Date
        </button>

        <button 
          className={`operation-btn ${showStatusControl ? 'active' : ''}`}
          onClick={() => {
            setShowStatusControl(!showStatusControl);
            setShowDateFilter(false);
          }}
        >
          <i className="fas fa-user-cog"></i>
          Activate/Deactivate
        </button>

        <button 
          className="operation-btn"
          onClick={() => {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            onSort(newDirection);
          }}
        >
          <i className={`fas fa-sort-alpha-${sortDirection === 'asc' ? 'down' : 'up'}`}></i>
          {sortDirection === 'asc' ? 'Sort Names A to Z' : 'Sort Names Z to A'}
        </button>

        <button 
          className={`operation-btn ${showDetailsControl ? 'active' : ''}`}
          onClick={() => {
            setShowDetailsControl(!showDetailsControl);
            setShowDateFilter(false);
            setShowStatusControl(false);
            setShowDeleteControl(false);
          }}
        >
          <i className="fas fa-info-circle"></i>
          View Details
        </button>

        <button 
          className={`operation-btn ${showDeleteControl ? 'active' : ''}`}
          onClick={() => {
            setShowDeleteControl(!showDeleteControl);
            setShowDateFilter(false);
            setShowStatusControl(false);
            setShowDetailsControl(false);
            setShowAddControl(false);
          }}
        >
          <i className="fas fa-trash"></i>
          Delete Employee
        </button>

        <button 
          className={`operation-btn ${showAddControl ? 'active' : ''}`}
          onClick={() => {
            setShowAddControl(!showAddControl);
            setShowDateFilter(false);
            setShowStatusControl(false);
            setShowDetailsControl(false);
            setShowDeleteControl(false);
          }}
        >
          <i className="fas fa-user-plus"></i>
          Add Employee
        </button>
      </div>

      {showDateFilter && (
        <div className="operation-panel">
          <h3>Search by Hire Date</h3>
          <form onSubmit={handleDateSearch}>
            <div className="date-inputs">
              <input
                type="date"
                max={getMaxDate()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <input
                type="date"
                max={getMaxDate()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
            <button type="submit" className="submit-btn">
              Search
            </button>
          </form>
        </div>
      )}

      {showStatusControl && (
        <div className="operation-panel">
          <h3>Activate/Deactivate Employee</h3>
          <div className="status-control">
            <input
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID"
            />
            <div className="status-buttons">
              <button
                className="activate-btn"
                onClick={() => handleStatusChange('activate')}
              >
                Activate
              </button>
              <button
                className="deactivate-btn"
                onClick={() => handleStatusChange('deactivate')}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsControl && (
        <div className="operation-panel">
          <h3>View Employee Details</h3>
          <div className="details-control">
            <input
              type="number"
              value={detailsId}
              onChange={(e) => setDetailsId(e.target.value)}
              placeholder="Enter Employee ID"
            />
            <button
              className="view-details-btn"
              onClick={() => {
                if (!detailsId) {
                  showNotification('Please enter an employee ID', 'error');
                  return;
                }
                const id = parseInt(detailsId, 10);
                const employee = employees.find(e => e.id === id);
                if (!employee) {
                  showNotification('Employee not found', 'error');
                  return;
                }
                onViewDetails(id);
                setDetailsId('');
                setShowDetailsControl(false);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {showDeleteControl && (
        <div className="operation-panel">
          <h3>Delete Employee</h3>
          <div className="delete-control">
            <input
              type="number"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              placeholder="Enter Employee ID"
            />
            <button
              className="delete-btn"
              onClick={() => {
                if (!deleteId) {
                  showNotification('Please enter an employee ID', 'error');
                  return;
                }
                const id = parseInt(deleteId, 10);
                const employee = employees.find(e => e.id === id);
                if (!employee) {
                  showNotification('Employee not found', 'error');
                  return;
                }
                if (employee.original) {
                  showNotification('Cannot delete original employees', 'error');
                  return;
                }
                onDelete(id);
                setDeleteId('');
                setShowDeleteControl(false);
              }}
            >
              Delete Employee
            </button>
          </div>
        </div>
      )}

      {showAddControl && (
        <div className="operation-panel">
          <h3>Add New Employee</h3>
          <div className="add-control">
            <button
              className="add-btn"
              onClick={() => {
                onAddEmployee();
                setShowAddControl(false);
              }}
            >
              <i className="fas fa-user-plus"></i> Add Employee
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div className={`operation-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default OperationButtons;
