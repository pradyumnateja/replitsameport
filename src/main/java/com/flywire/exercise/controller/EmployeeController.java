package com.flywire.exercise.controller;

import com.flywire.exercise.model.Employee;
import com.flywire.exercise.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllActiveEmployees() throws IOException {
        return ResponseEntity.ok(employeeService.getAllActiveEmployees());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() throws IOException {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEmployeeWithDirectHires(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(employeeService.getEmployeeWithDirectHires(id));
    }

    @GetMapping("/hired")
    public ResponseEntity<List<Employee>> getEmployeesByHireDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) throws IOException {
        System.out.println("Received dates - start: " + startDate + ", end: " + endDate);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        
        Date parsedStartDate = null;
        Date parsedEndDate = null;
        
        try {
            parsedStartDate = dateFormat.parse(startDate);
            parsedEndDate = dateFormat.parse(endDate);
            System.out.println("Successfully parsed dates - start: " + parsedStartDate + ", end: " + parsedEndDate);
        } catch (ParseException e) {
            System.out.println("Failed to parse dates: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
        
        if (parsedStartDate == null || parsedEndDate == null) {
            return ResponseEntity.badRequest().body(null);
        }
        
        // Get today's date at midnight
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date today = cal.getTime();

        // Validate that dates are not in the future
        if (parsedStartDate.after(today) || parsedEndDate.after(today)) {
            System.out.println("Date validation failed: Future dates not allowed");
            return ResponseEntity.badRequest().body(null);
        }

        // Validate start date is before or equal to end date
        if (parsedStartDate.after(parsedEndDate)) {
            System.out.println("Date validation failed: Start date after end date");
            return ResponseEntity.badRequest().body(null);
        }
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        parsedEndDate = cal.getTime();

        if (parsedStartDate.after(today) || parsedEndDate.after(today)) {
            return ResponseEntity.badRequest().body(null);
        }
        // Validate dates
        return ResponseEntity.ok(employeeService.getEmployeesByHireDateRange(parsedStartDate, parsedEndDate));
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(
            @RequestBody Employee employee,
            @RequestParam(required = false) Long managerId) throws IOException {
        return ResponseEntity.ok(employeeService.createEmployee(employee, managerId));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Employee> deactivateEmployee(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(employeeService.deactivateEmployee(id));
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Employee> reactivateEmployee(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok(employeeService.reactivateEmployee(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) throws IOException {
        System.out.println("Received DELETE request for employee ID: " + id);
        employeeService.deleteEmployee(id);
        System.out.println("Successfully deleted employee ID: " + id);
        return ResponseEntity.ok().build();
    }
}
