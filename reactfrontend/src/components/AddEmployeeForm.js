import React, { useState } from 'react';
import './AddEmployeeForm.css';
import ErrorModal from './ErrorModal';

const AddEmployeeForm = ({ onSubmit, onCancel, employees }) => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const getMaxDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    return '1925-04-13';
  };
  
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (selectedDate > getMaxDate()) {
      setValidationError('Hire date cannot be in the future');
      setShowErrorModal(true);
      e.target.value = getMaxDate();
      handleChange({ ...e, target: { ...e.target, value: getMaxDate() } });
      return;
    }
    handleChange(e);
  };
  
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    position: '',
    hireDate: '',

    directReports: [],
    managerId: ''
  });

  // Sort employees by name for the dropdown
  const sortedEmployees = [...(employees || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const [validationError, setValidationError] = useState(null);
  const clearError = () => {
    setValidationError(null);
    setShowErrorModal(false);
  };
  
  const handleChange = (e) => {
    clearError();
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'select-multiple' 
        ? Array.from(e.target.selectedOptions).map(option => parseInt(option.value, 10))
        : value
    }));
    clearError();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    // Validate required fields
    if (!formData.id.trim()) {
      setValidationError("Employee ID is required");
      setShowErrorModal(true);
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setValidationError("Both first and last names are required");
      setShowErrorModal(true);
      return;
    }

    if (!formData.position.trim()) {
      setValidationError("Position is required");
      setShowErrorModal(true);
      return;
    }

    if (!formData.managerId) {
      setValidationError("Manager is required");
      setShowErrorModal(true);
      return;
    }

    // Validate ID is unique
    const employeeId = parseInt(formData.id, 10);
    if (isNaN(employeeId)) {
      setValidationError("Employee ID must be a valid number");
      setShowErrorModal(true);
      return;
    }

    // Check for duplicate ID
    const isDuplicate = employees.some(emp => emp.id === employeeId);
    if (isDuplicate) {
      setValidationError(`Employee ID ${employeeId} is already in use. Please choose a different ID.`);
      setShowErrorModal(true);
      return;
    }
    
    // Convert date from YYYY-MM-DD to MM/dd/yyyy format while preserving the actual date
    console.log('Original hire date:', formData.hireDate);
    // Split the date directly instead of using Date object to avoid timezone issues
    const [year, month, day] = formData.hireDate.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    console.log('Formatted hire date:', formattedDate);
    
    // Validate direct reports if any are selected
    if (formData.directReports.length > 0) {
      const invalidReports = formData.directReports.filter(
        id => !employees.some(e => e.id === id)
      );
      if (invalidReports.length > 0) {
        setValidationError(
          `The following direct report IDs do not exist: ${invalidReports.join(', ')}`
        );
        setShowErrorModal(true);
        return;
      }
    }

    const employeeData = {
      id: parseInt(formData.id, 10),  // Use the ID entered by the user
      name: `${formData.firstName} ${formData.lastName}`,
      position: formData.position,
      hireDate: formattedDate,
      active: true,
      directReports: formData.directReports || [],  // Ensure directReports is always an array
      managerId: parseInt(formData.managerId, 10)
    };

    // console.log('Employee data:', employeeData);
    
    // If managerId is NaN, set it to null
    if (isNaN(employeeData.managerId)) {
      employeeData.managerId = null;
    }
    
    // Remove managerId from the employee object, as it's passed separately
    try {
      const { managerId, ...employee } = employeeData;
      await onSubmit(employee, managerId);
    } catch (error) {
      // Handle backend validation errors
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while adding the employee';
      setValidationError(errorMessage);
      setShowErrorModal(true);
      return;
    }
  };
  
  return (
    <>
      {validationError && showErrorModal && (
        <ErrorModal
          message={validationError}
          onClose={clearError}
        />
      )}
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Add New Employee</h2>
            <button type="button" onClick={onCancel}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Pradyumna Teja"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Smith"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Software Engineer"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="hireDate">Hire Date</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                onKeyDown={(e) => e.preventDefault()}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="id">Employee ID</label>
              <input
                type="number"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Enter a unique ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="directReports">Direct Reports</label>
              <select
                id="directReports"
                name="directReports"
                multiple
                value={formData.directReports}
                onChange={handleChange}
              >
                {sortedEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.position}
                  </option>
                ))}
              </select>
              <small className="form-text">Hold Ctrl/Cmd to select multiple employees</small>
            </div>

            <div className="form-group">
              <label htmlFor="managerId">Manager</label>
              <select
                id="managerId"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select a manager</option>
                {sortedEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Add Employee
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddEmployeeForm;
