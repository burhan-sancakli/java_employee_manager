import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Table, Button } from 'react-bootstrap';

const SERVER_BASE_URL = 'http://127.0.0.1:8080';

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [olderEmployees, setOlderEmployees] = useState([]);
  const [employeesExtraStats, setEmployeesExtraStats] = useState([]);
  const [employeesTotalWorkAmount, setEmployeesTotalWorkAmount] = useState(null);

  useEffect(() => {
    
  }, [employeesExtraStats]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(SERVER_BASE_URL+"/get-all-employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchOlderEmployees = async (event) => {
    try {
      let age = event.target.value;
      if (age!=""){
        let ids = employees.map(item => item.id);
        const response = await fetch(SERVER_BASE_URL+"/get-employees-older-than/"+age.toString()+"/?ids="+ids.join(','));
        const data = await response.json();
        setOlderEmployees(data);
        return;
      }
    } catch (error) {
      console.error('Error fetching olderEmployees:', error);
    }
    setOlderEmployees([]);
  };

  const fetchEmployeesExtraStats = async (event) => {
    try {
      if (event.target.checked){
        let ids = employees.map(item => item.id);
        const response = await fetch(SERVER_BASE_URL+"/get-employees-age-and-service?ids="+ids.join(','));
        const data = await response.json();
        setEmployeesExtraStats(data);
        return;
      }
    } catch (error) {
      console.error('Error fetching employeesExtraStats:', error);
    }
    setEmployeesExtraStats([]);
  };
  const fetchEmployeesTotalWorkAmount = async (event) => {
    try {
      if (event.target.checked){
        let ids = employees.map(item => item.id);
        const response = await fetch(SERVER_BASE_URL+"/get-employees-total-work-amount?ids="+ids.join(','));
        const data = await response.json();
        setEmployeesTotalWorkAmount(data.total_work_amount);
        return;
      }
    } catch (error) {
      console.error('Error fetching employeesExtraStats:', error);
    }
    setEmployeesTotalWorkAmount(null);
  };



  function renderExtraStats(employee){
    if (employeesExtraStats.length == 0 ){ return <></> }
    let age = "";
    let service_length = "";
    employeesExtraStats.forEach((emp) => {
      if (Number(employee.id) === Number(emp.id)){
        age = emp.age;
        service_length = emp.service_length;
      }
    });
    return <>
      <td>{age}</td> 
      <td>{service_length}</td> 
    </>
  }
  return (
    <div class="px-5">
      <h1>Employee Table</h1>
      <Row>
        <Col>
          <Button variant="primary" onClick={fetchEmployees}>
            Fetch Employees
          </Button>
        </Col>
        <Col>
          <input type="text" onChange={fetchOlderEmployees} placeholder="Enter age" />
        </Col>
        <Col>
          Show Employees Age And Service Length<input type="checkbox" onChange={fetchEmployeesExtraStats}/>
        </Col>
        <Col>
          Show Total Work Done<input type="checkbox" onChange={fetchEmployeesTotalWorkAmount}/>
        </Col>
      </Row>
      <Row>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Surname</th>
              <th>Name</th>
              <th>Number of Hours</th>
              <th>Hourly Rate</th>
              <th>Birth Date</th>
              <th>Job Date</th>
              <th>Value of Work Done ($)</th>
              {
                employeesExtraStats.length != 0 ? 
                  <>
                    <th>Age</th> 
                    <th>Length of Service (in Years)</th> 
                  </>
                  
                : 
                  <></>
              }
            </tr>
          </thead>
          <tbody>
          {
              employeesTotalWorkAmount!=null ? 
                <>
                  <tr key={employees.length}>
                    <td>Total Work ($)</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{employeesTotalWorkAmount}$</td>
                    {
                      employeesExtraStats.length != 0 ? 
                        <>
                          <td></td> 
                          <td></td>
                        </>
                        
                      : 
                        <></>
                    }
                  </tr>
                </>
              : 
                <></>
            }
            {employees.map((employee, i) => (
              <tr key={i}>
                <td>{employee.id}</td>
                <td>{employee.surname}</td>
                <td>{employee.name}</td>
                <td>{employee.number_of_hours}</td>
                <td>{employee.hourly_rate}</td>
                <td className={olderEmployees.some((emp) => emp.id === employee.id) ? 'bg-danger' : ''}>{`${employee.birth_day}/${employee.birth_month}/${employee.birth_year}`}</td>
                <td>{`${employee.job_day}/${employee.job_month}/${employee.job_year}`}</td>
                <td>{Number(employee.value_of_work_done).toFixed()}$</td>
                {renderExtraStats(employee)}
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </div>
  );
};


export default App;
