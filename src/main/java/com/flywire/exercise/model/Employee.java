package com.flywire.exercise.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;

public class Employee {
    private Long id;
    private String name;
    private String position;
    private boolean active;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM/dd/yyyy")
    private Date hireDate;
    private List<Long> directReports;
    private boolean original;

    public Employee() {
        this.directReports = new ArrayList<>();
        this.original = false;
    }

    public Employee(Long id, String name, String position, boolean active, Date hireDate, boolean original) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.active = active;
        this.hireDate = hireDate;
        this.directReports = new ArrayList<>();
        this.original = original;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Date getHireDate() {
        return hireDate;
    }

    public void setHireDate(Date hireDate) {
        this.hireDate = hireDate;
    }

    public List<Long> getDirectReports() {
        return directReports;
    }

    public void setDirectReports(List<Long> directReports) {
        this.directReports = directReports;
    }

    public boolean isOriginal() {
        return original;
    }

    public void setOriginal(boolean original) {
        this.original = original;
    }

    @JsonIgnore
    public String getFormattedHireDate() {
        if (hireDate != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");
            return sdf.format(hireDate);
        }
        return null;
    }
}
