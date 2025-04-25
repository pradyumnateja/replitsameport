import React, { useState } from 'react';
import './DateRangeFilter.css';
import ErrorModal from './ErrorModal';

const DateRangeFilter = ({ onFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const getMaxDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    return '1925-04-13';
  };

  const validateDate = (date) => {
    if (!date) return true;
    
    if (date > getMaxDate()) {
      setValidationError('Selected date cannot be in the future');
      setShowErrorModal(true);
      return false;
    }

    if (date < getMinDate()) {
      setValidationError('Date cannot be more than 100 years in the past');
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);
    setShowErrorModal(false);

    if (!startDate || !endDate) {
      setValidationError('Both start and end dates are required');
      setShowErrorModal(true);
      return;
    }

    if (startDate > getMaxDate() || endDate > getMaxDate()) {
      setValidationError('Selected dates cannot be in the future');
      setShowErrorModal(true);
      return;
    }

    if (endDate < startDate) {
      setValidationError('End date must be after start date');
      setShowErrorModal(true);
      return;
    }

    if (validateDate(startDate) && validateDate(endDate)) {
      // Keep dates in YYYY-MM-DD format for the backend
      console.log('Submitting date range:', { startDate, endDate });
      onFilter(startDate, endDate);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setValidationError(null);
    setShowErrorModal(false);
    onFilter(null, null);
  };

  const handleDateChange = (setter) => (e) => {
    const value = e.target.value;
    
    if (value > getMaxDate()) {
      setValidationError('Selected date cannot be in the future');
      setShowErrorModal(true);
      return;
    }
    
    if (validateDate(value)) {
      setter(value);
      setValidationError(null);
      setShowErrorModal(false);
    } else {
      setter('');
    }
  };

  return (
    <>
      {validationError && showErrorModal && (
        <ErrorModal
          message={validationError}
          onClose={() => {
            setValidationError(null);
            setShowErrorModal(false);
          }}
        />
      )}
      <form onSubmit={handleSubmit} className="date-range-filter">
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={handleDateChange(setStartDate)}
            min={getMinDate()}
            max={today}
            onKeyDown={(e) => e.preventDefault()}
            required
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={handleDateChange(setEndDate)}
            min={getMinDate()}
            max={today}
            onKeyDown={(e) => e.preventDefault()}
            required
          />
        </div>
      </div>
      <div className="filter-buttons">
        <button type="submit" className="filter-btn">Filter</button>
        <button type="button" onClick={handleClear} className="clear-btn">Clear</button>
      </div>
    </form>
    </>
  );
};

export default DateRangeFilter;
