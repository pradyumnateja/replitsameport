import axios from 'axios';

const API_URL = '/api/employees';

const handleError = (error, message) => {
  console.error(message, error);
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw error;
};

const EmployeeService = {
  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all employees:', error);
      throw error;
    }
  },
  
  getActiveEmployees: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching active employees:', error);
      throw error;
    }
  },
  
  getEmployeeDetails: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee details for ID ${id}:`, error);
      throw error;
    }
  },
  
  createEmployee: async (employee, managerId) => {
    try {
      const url = managerId ? `${API_URL}?managerId=${managerId}` : API_URL;
      // Backend expects dates in MM/dd/yyyy format
      const employeeData = {
        ...employee,
        hireDate: employee.hireDate // hireDate should already be in MM/dd/yyyy format from the form
      };
      const response = await axios.post(url, employeeData);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating employee');
    }
  },
  
  deactivateEmployee: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/deactivate`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error deactivating employee with ID ${id}`);
    }
  },
  
  activateEmployee: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/reactivate`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error activating employee with ID ${id}`);
    }
  },
  
  getEmployeesByHireDate: async (startDate, endDate) => {
    try {
      // Validate dates
      const today = '2025-04-13';
      const minDate = '1925-04-13';

      if (startDate > today || endDate > today) {
        throw new Error('Cannot search with future dates');
      }

      if (startDate < minDate || endDate < minDate) {
        throw new Error('Dates cannot be more than 100 years in the past');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before or equal to end date');
      }

      console.log('Sending date range request:', { startDate, endDate });
      const response = await axios.get(`${API_URL}/hired`, {
        params: {
          startDate: startDate,
          endDate: endDate
        }
      });
      console.log('Got response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees by hire date:', error);
      throw error;
    }
  },



  deleteEmployee: async (id) => {
    console.log(`Attempting to delete employee with ID: ${id}`);
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      console.log(`Successfully deleted employee with ID: ${id}`, response);
    } catch (error) {
      console.error(`Failed to delete employee with ID: ${id}`, error.response || error);
      return handleError(error, `Error deleting employee with ID ${id}`);
    }
  }
};

export default EmployeeService;
