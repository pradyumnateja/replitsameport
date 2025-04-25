package com.flywire.exercise.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.flywire.exercise.model.Employee;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.TimeZone;

@Component
public class FileUtil {

    private final ObjectMapper objectMapper;
    private final String NEW_DATA_FILE = "data/new_employees.json";
    private final File newEmployeesFile;

    public FileUtil() throws IOException {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        this.objectMapper.setDateFormat(sdf);

        // Create data directory if it doesn't exist
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir.mkdir();
        }

        // Initialize new employees file
        this.newEmployeesFile = new File(NEW_DATA_FILE);
        if (!newEmployeesFile.exists()) {
            objectMapper.writeValue(newEmployeesFile, new ArrayList<Employee>());
        }
    }

    public List<Employee> readEmployees() throws IOException {
        // Read original employees
        List<Employee> originalEmployees;
        try (InputStream is = new ClassPathResource("json/data.json").getInputStream()) {
            originalEmployees = objectMapper.readValue(is, new TypeReference<List<Employee>>() {});
            // Mark all original employees
            originalEmployees.forEach(emp -> emp.setOriginal(true));
        }

        // Read status overrides and new employees
        final List<Employee> newEmployees = newEmployeesFile.exists() && newEmployeesFile.length() > 0 ?
            objectMapper.readValue(newEmployeesFile, new TypeReference<List<Employee>>() {}) :
            new ArrayList<>();

        // Create a map of all employees
        Map<Long, Employee> employeeMap = new HashMap<>();

        // First, add all original employees
        originalEmployees.forEach(emp -> employeeMap.put(emp.getId(), emp));

        // Then process overrides and new employees
        for (Employee emp : newEmployees) {
            if (employeeMap.containsKey(emp.getId())) {
                // Update status of original employee
                Employee original = employeeMap.get(emp.getId());
                original.setActive(emp.isActive());
            } else {
                // Add new employee
                emp.setOriginal(false);
                employeeMap.put(emp.getId(), emp);
            }
        }

        // Return only employees that exist in new_employees.json (for non-original employees)
        // or original employees that haven't been deleted
        return employeeMap.values().stream()
            .filter(emp -> emp.isOriginal() || newEmployees.stream().anyMatch(e -> e.getId().equals(emp.getId())))
            .collect(Collectors.toList());
    }

    public void writeEmployees(List<Employee> employees) throws IOException {
        // Get original employees to identify them
        List<Employee> originalEmployees;
        try (InputStream is = new ClassPathResource("json/data.json").getInputStream()) {
            originalEmployees = objectMapper.readValue(is, new TypeReference<List<Employee>>() {});
        }
        
        // Create a map of original employee IDs
        Set<Long> originalIds = originalEmployees.stream()
            .map(Employee::getId)
            .collect(Collectors.toSet());

        // Read existing overrides
        List<Employee> existingOverrides = new ArrayList<>();
        if (newEmployeesFile.exists() && newEmployeesFile.length() > 0) {
            existingOverrides = objectMapper.readValue(newEmployeesFile, new TypeReference<List<Employee>>() {});
        }
        
        // Create a map of existing overrides
        Map<Long, Employee> overridesMap = existingOverrides.stream()
            .collect(Collectors.toMap(Employee::getId, e -> e));

        // First, remove any employees that are not in the input list
        Set<Long> currentEmployeeIds = employees.stream()
            .map(Employee::getId)
            .collect(Collectors.toSet());

        // Remove employees that are no longer present (deleted)
        overridesMap.keySet().removeIf(id -> !currentEmployeeIds.contains(id));

        // Process each employee in the input list
        for (Employee emp : employees) {
            if (originalIds.contains(emp.getId())) {
                // This is an original employee, update or create override
                Employee override = overridesMap.computeIfAbsent(emp.getId(), k -> {
                    Employee e = new Employee();
                    e.setId(emp.getId());
                    return e;
                });
                override.setActive(emp.isActive());
                override.setDirectReports(emp.getDirectReports());
                override.setName(emp.getName());
                override.setPosition(emp.getPosition());
                override.setHireDate(emp.getHireDate());
            } else if (!emp.isOriginal()) {
                // This is a new employee, update or add to overrides
                overridesMap.put(emp.getId(), emp);
            }
        }

        // Write all overrides and new employees to the file
        objectMapper.writeValue(newEmployeesFile, new ArrayList<>(overridesMap.values()));
    }


}
