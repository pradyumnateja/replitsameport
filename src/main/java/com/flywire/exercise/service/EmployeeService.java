package com.flywire.exercise.service;

import com.flywire.exercise.exception.EmployeeNotFoundException;
import com.flywire.exercise.exception.InvalidEmployeeDataException;
import com.flywire.exercise.model.Employee;
import com.flywire.exercise.util.FileUtil;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.TimeZone;

@Service
public class EmployeeService {

    private final FileUtil fileUtil;

    public EmployeeService(FileUtil fileUtil) {
        this.fileUtil = fileUtil;
    }

    public List<Employee> getAllActiveEmployees() throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        return employees.stream()
                .filter(Employee::isActive)
                .sorted(Comparator.comparing(e -> e.getName().split(" ")[1])) // Sort by last name
                .collect(Collectors.toList());
    }

    public List<Employee> getAllEmployees() throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        return employees.stream()
                .sorted(Comparator.comparing(e -> e.getName().split(" ")[1])) // Sort by last name
                .collect(Collectors.toList());
    }

    public Map<String, Object> getEmployeeWithDirectHires(Long id) throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        
        // Find the employee
        Employee employee = employees.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        // Get direct reports that still exist in the system
        List<Employee> directHires = new ArrayList<>();
        if (employee.getDirectReports() != null && !employee.getDirectReports().isEmpty()) {
            directHires = employees.stream()
                    .filter(e -> employee.getDirectReports().contains(e.getId()))
                    .collect(Collectors.toList());

            // Update employee's direct reports to only include existing employees
            employee.setDirectReports(directHires.stream()
                    .map(Employee::getId)
                    .collect(Collectors.toList()));
            fileUtil.writeEmployees(employees);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("employee", employee);
        response.put("directHires", directHires);
        return response;
    }

    public List<Employee> getEmployeesByHireDateRange(Date startDate, Date endDate) throws IOException {
        SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

        // Validate dates
        if (startDate == null || endDate == null) {
            throw new InvalidEmployeeDataException("Both start date and end date are required");
        }

        try {
            // Normalize input dates
            startDate = sdf.parse(sdf.format(startDate));
            endDate = sdf.parse(sdf.format(endDate));

            if (startDate.after(endDate)) {
                throw new InvalidEmployeeDataException("Start date must be before end date");
            }

            System.out.println("Searching for employees between " + sdf.format(startDate) + " and " + sdf.format(endDate));

            // Get all employees and filter by hire date
            List<Employee> employees = fileUtil.readEmployees();
            System.out.println("Total employees before filtering: " + employees.size());

            List<Employee> filteredEmployees = new ArrayList<>();
            
            for (Employee e : employees) {
                if (e.getHireDate() == null) {
                    System.out.println("Skipping employee " + e.getName() + ": no hire date");
                    continue;
                }

                // Normalize hire date
                Date hireDate = sdf.parse(sdf.format(e.getHireDate()));
                System.out.println("Checking employee " + e.getName() + " with hire date: " + sdf.format(hireDate));

                if ((hireDate.equals(startDate) || hireDate.after(startDate)) && 
                    (hireDate.equals(endDate) || hireDate.before(endDate))) {
                    System.out.println("Including employee: " + e.getName());
                    filteredEmployees.add(e);
                } else {
                    System.out.println("Excluding employee: " + e.getName() + 
                                     " (hire date outside range: " + sdf.format(hireDate) + ")");
                }
            }

            // Sort by hire date descending
            filteredEmployees.sort((e1, e2) -> e2.getHireDate().compareTo(e1.getHireDate()));

            System.out.println("Found " + filteredEmployees.size() + " employees in date range");
            return filteredEmployees;

        } catch (ParseException ex) {
            System.err.println("Error parsing dates: " + ex.getMessage());
            throw new InvalidEmployeeDataException("Error processing dates");
        }
    }

    public Employee createEmployee(Employee employee, Long managerId) throws IOException {
        List<Employee> employees = fileUtil.readEmployees();

        // Validate required fields
        if (employee.getName() == null || employee.getName().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("Employee name is required");
        }
        if (employee.getPosition() == null || employee.getPosition().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("Employee position is required");
        }
        if (employee.getHireDate() == null) {
            throw new InvalidEmployeeDataException("Hire date is required");
        }
        // Normalize dates for comparison
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date today = cal.getTime();

        cal.setTime(employee.getHireDate());
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        employee.setHireDate(cal.getTime());

        if (employee.getHireDate().after(today)) {
            throw new InvalidEmployeeDataException("Hire date cannot be in the future");
        }

        // Name validation
        String name = employee.getName().trim();
        if (name.isEmpty()) {
            throw new InvalidEmployeeDataException("Name is required");
        }

        // Date format validation
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
            dateFormat.setLenient(false);
            String formattedDate = dateFormat.format(employee.getHireDate());
            Date parsedDate = dateFormat.parse(formattedDate);
            employee.setHireDate(parsedDate);
        } catch (ParseException e) {
            throw new InvalidEmployeeDataException("Invalid hire date format. Expected format: MM/DD/YYYY");
        }

        // Validate manager
        if (managerId != null) {
            Employee manager = employees.stream()
                    .filter(e -> e.getId().equals(managerId))
                    .findFirst()
                    .orElseThrow(() -> new EmployeeNotFoundException("Manager not found with id: " + managerId));

            if (!manager.isActive()) {
                throw new InvalidEmployeeDataException("Cannot assign an inactive employee as manager");
            }

            // Add employee to manager's direct reports
            List<Long> reports = new ArrayList<>(manager.getDirectReports());
            reports.add(employee.getId());
            manager.setDirectReports(reports);
        }

        // Set default values
        employee.setActive(true);
        if (employee.getDirectReports() == null) {
            employee.setDirectReports(new ArrayList<>());  // Only set empty list if null
        }
        employee.setOriginal(false);  // Mark as a new employee

        // Validate direct reports if provided
        if (!employee.getDirectReports().isEmpty()) {
            for (Long reportId : employee.getDirectReports()) {
                if (!employees.stream().anyMatch(e -> e.getId().equals(reportId))) {
                    throw new InvalidEmployeeDataException("Direct report not found with id: " + reportId);
                }
            }
        }

        // Validate that the ID doesn't already exist
        if (employee.getId() == null) {
            throw new InvalidEmployeeDataException("Employee ID is required");
        }
        
        boolean idExists = employees.stream()
                .anyMatch(e -> e.getId().equals(employee.getId()));
        if (idExists) {
            throw new InvalidEmployeeDataException("Employee ID " + employee.getId() + " already exists");
        }

        employees.add(employee);
        fileUtil.writeEmployees(employees);
        return employee;
    }

    public Employee deactivateEmployee(Long id) throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        Employee employee = employees.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        if (!employee.isActive()) {
            throw new InvalidEmployeeDataException("Employee is already inactive");
        }

        // Remove this employee from their manager's direct reports
        employees.stream()
                .filter(e -> e.getDirectReports().contains(id))
                .findFirst()
                .ifPresent(manager -> {
                    List<Long> reports = new ArrayList<>(manager.getDirectReports());
                    reports.remove(id);
                    manager.setDirectReports(reports);
                });

        // Deactivate the employee
        employee.setActive(false);
        employee.setDirectReports(new ArrayList<>()); // Clear direct reports when deactivating

        fileUtil.writeEmployees(employees);
        return employee;
    }

    public Employee reactivateEmployee(Long id) throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        Employee employee = employees.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        if (employee.isActive()) {
            throw new InvalidEmployeeDataException("Employee is already active");
        }

        employee.setActive(true);
        fileUtil.writeEmployees(employees);
        return employee;
    }

    public void deleteEmployee(Long id) throws IOException {
        List<Employee> employees = fileUtil.readEmployees();
        Employee employee = employees.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));

        // Check if employee is original
        if (employee.isOriginal()) {
            throw new InvalidEmployeeDataException("Cannot delete original employees");
        }

        // Remove this employee from their manager's direct reports
        employees.stream()
                .filter(e -> e.getDirectReports().contains(id))
                .findFirst()
                .ifPresent(manager -> {
                    List<Long> reports = new ArrayList<>(manager.getDirectReports());
                    reports.remove(id);
                    manager.setDirectReports(reports);
                });

        // Remove the employee
        employees.removeIf(e -> e.getId().equals(id));
        fileUtil.writeEmployees(employees);
    }
}
