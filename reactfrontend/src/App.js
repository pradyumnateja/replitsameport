import React, { useState, useEffect } from 'react';
import EmployeeTable from './components/EmployeeTable';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeForm from './components/AddEmployeeForm';
import OperationButtons from './components/OperationButtons';
import EmployeeService from './services/EmployeeService';
import LoginScreen from './components/LoginScreen';

function App() {
  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch employees on component mount and filter change
  useEffect(() => {
    fetchEmployees();
  }, [filter, dateRange.startDate, dateRange.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const getToday = () => '2025-04-13';
  const getMinDate = () => '1925-04-13';

  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (dateRange.startDate && dateRange.endDate) {
        // Validate dates before fetching
        const today = getToday();
        const minDate = getMinDate();

        if (dateRange.startDate > today || dateRange.endDate > today) {
          setError('Cannot search with future dates');
          setLoading(false);
          return;
        }

        if (dateRange.startDate < minDate || dateRange.endDate < minDate) {
          setError('Dates cannot be more than 100 years in the past');
          setLoading(false);
          return;
        }

        if (dateRange.startDate > dateRange.endDate) {
          setError('Start date must be before or equal to end date');
          setLoading(false);
          return;
        }

        // If date range is valid, fetch by date range
        console.log('Fetching with date range:', dateRange);
        data = await EmployeeService.getEmployeesByHireDate(dateRange.startDate, dateRange.endDate);
      } else {
        // Get employees based on active/inactive filter
        if (filter === 'active') {
          data = await EmployeeService.getActiveEmployees();
        } else {
          data = await EmployeeService.getAllEmployees();
          // Filter for inactive if needed
          if (filter === 'inactive') {
            data = data.filter(employee => !employee.active);
          }
        }
      }
      
      if (data) {
        setEmployees(data);
        setError(null); // Clear any previous errors if data is received successfully
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.response?.status === 400) {
        // Don't show error for 400 Bad Request (expected when dates are invalid)
        setEmployees([]);
      } else {
        setError(`Failed to load employees. ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to view employee details
  const handleViewDetails = async (id) => {
    try {
      const details = await EmployeeService.getEmployeeDetails(id);
      setSelectedEmployee(details);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      
      // Handle resourceFile read issues with client-side fallback
      const employee = employees.find(emp => emp.id === id);
      if (employee) {
        // Create a simulated response with the data we have
        const simulatedDetails = {
          employee: employee,
          directHires: employees.filter(emp => 
            employee.directReports?.includes(emp.id) || false
          )
        };
        setSelectedEmployee(simulatedDetails);
        showNotification(
          "Using local data due to backend limitations. Direct reports may not be accurate.",
          "warning"
        );
      } else {
        setError(`Failed to load employee details: ${err.message}`);
      }
    }
  };

  // Function to handle employee status change
  const handleStatusChange = async (id, currentStatus) => {
    try {
      setLoadingEmployeeId(id);
      
      // Call the appropriate service method
      if (currentStatus) {
        await EmployeeService.deactivateEmployee(id);
      } else {
        await EmployeeService.activateEmployee(id);
      }
      
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === id ? { ...emp, active: !currentStatus } : emp
        )
      );
      
      showNotification(
        `Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`
      );
      
      if (selectedEmployee && selectedEmployee.employee.id === id) {
        const details = await EmployeeService.getEmployeeDetails(id);
        setSelectedEmployee(details);
      }
      
      fetchEmployees();
      
    } catch (err) {
      console.error('Error changing employee status:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoadingEmployeeId(null);
    }
  };

  const handleDeleteEmployee = async (id) => {
    console.log('Delete requested for employee ID:', id);
    
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      console.log('Delete cancelled by user for employee ID:', id);
      return;
    }

    try {
      console.log('Starting delete process for employee ID:', id);
      setLoadingEmployeeId(id); // Show loading state
      await EmployeeService.deleteEmployee(id);
      console.log('Successfully deleted employee ID:', id);
      await fetchEmployees(); // Refresh the list
      showNotification('Employee deleted successfully');
    } catch (err) {
      console.error('Error in handleDeleteEmployee:', err);
      if (err.response?.data?.message?.includes('Cannot delete original employees')) {
        showNotification('Cannot delete original employees', 'error');
      } else {
        showNotification(`Failed to delete employee: ${err.message}`, 'error');
      }
    } finally {
      setLoadingEmployeeId(null); // Clear loading state
    }
  };

  const handleAddEmployee = async (employee, managerId) => {
    try {
      // Check if ID is unique
      const allEmployees = await EmployeeService.getAllEmployees();
      if (allEmployees.some(e => e.id === employee.id)) {
        showNotification(`Employee ID ${employee.id} already exists`, 'error');
        return;
      }


      // Validate direct reports if provided
      if (employee.directReports.length > 0) {
        const invalidReports = employee.directReports.filter(
          id => !allEmployees.some(e => e.id === id)
        );
        if (invalidReports.length > 0) {
          showNotification(
            `The following direct report IDs do not exist: ${invalidReports.join(', ')}`,
            'error'
          );
          return;
        }
      }

      const newEmployee = await EmployeeService.createEmployee(employee, managerId);
      setShowAddForm(false);
      fetchEmployees();
      showNotification(`Employee ${newEmployee.name} added successfully`);
    } catch (err) {
      console.error('Error adding employee:', err);
      const errorMessage = err.response?.data?.message || err.message;
      throw new Error(errorMessage);  // Re-throw for form handling
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="container">
      <div className="app-header">
        <h1>Employee Management System</h1>
      </div>
      
      <div className="header-actions">
        <div className="filter-buttons">
          <div className="action-group">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilter('all');
                setDateRange({ startDate: null, endDate: null });
              }}
            >
              <i className="fas fa-list"></i> All Employees
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => {
                setFilter('active');
                setDateRange({ startDate: null, endDate: null });
              }}
            >
              <i className="fas fa-user-check"></i> Active Employees
            </button>
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => {
                setFilter('inactive');
                setDateRange({ startDate: null, endDate: null });
              }}
            >
              <i className="fas fa-user-times"></i> Inactive Employees
            </button>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(prev => ({ ...prev, show: false }))}>
            &times;
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}
      
      {/* Loading or employee table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : (
        <>
          <OperationButtons
            onDateSearch={(startDate, endDate) => {
              setDateRange({ startDate, endDate });
              fetchEmployees();
            }}
            onStatusChange={handleStatusChange}
            onSort={(direction) => {
              const sortedEmployees = [...employees].sort((a, b) => {
                const lastNameA = a.name.split(' ').pop();
                const lastNameB = b.name.split(' ').pop();
                return direction === 'asc' 
                  ? lastNameA.localeCompare(lastNameB)
                  : lastNameB.localeCompare(lastNameA);
              });
              setEmployees(sortedEmployees);
            }}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteEmployee}
            onAddEmployee={() => setShowAddForm(true)}
            employees={employees}
          />

          <EmployeeTable 
            employees={employees} 
          />

          <div className="refresh-section">
            <button className="refresh-btn" onClick={fetchEmployees}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </>
      )}
      
      {/* Modal for employee details */}
      {selectedEmployee && (
        <EmployeeDetails 
          employeeDetails={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}
      
      {/* Modal for adding employee */}
      {showAddForm && (
        <AddEmployeeForm 
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddForm(false)}
          employees={employees}
        />
      )}
    </div>
  );
}

export default App;
