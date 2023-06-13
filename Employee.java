import java.util.concurrent.TimeUnit;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.text.SimpleDateFormat;
import java.text.ParseException;

public class Employee {
    final static String FILE_DEST = "vhodnipodatki2.txt";

    public int id;
    public String surname;
    public String name;
    public int number_of_hours;
    public double hourly_rate;
    public int birth_day;
    public int birth_month;
    public int birth_year;
    public int job_day;
    public int job_month;
    public int job_year;

    public double value_of_work_done;

    public Employee(int id, String surname, String name, int number_of_hours, double hourly_rate, int birth_day,
            int birth_month, int birth_year, int job_day, int job_month, int job_year) {
        this.id = id;
        this.surname = surname;
        this.name = name;
        this.number_of_hours = number_of_hours;
        this.hourly_rate = hourly_rate;
        this.birth_day = birth_day;
        this.birth_month = birth_month;
        this.birth_year = birth_year;
        this.job_day = job_day;
        this.job_month = job_month;
        this.job_year = job_year;

        this.value_of_work_done = this.calculateValueOfWorkDone();
    }

    private double calculateValueOfWorkDone() {
        return Double.valueOf(this.number_of_hours * this.hourly_rate);
    }

    private int getAge() {
        return ((int) calculateDateDifference(this.birth_day, this.birth_month, this.birth_year)) / 365;
    }

    private long getServiceLength() {
        long days_of_work = calculateDateDifference(this.job_day, this.job_month, this.job_year);
        return days_of_work / 365;
    }

    public static long calculateDateDifference(int job_day, int job_month, int job_year) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date jobDate = sdf.parse(String.format("%04d-%02d-%02d", job_year, job_month, job_day));
            Date currentDate = sdf.parse(sdf.format(new Date()));
            long diff = currentDate.getTime() - jobDate.getTime();
            return TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);
        } catch (ParseException e) {
            return -1;
        }
    }

    private static ArrayList<Employee> getAllEmployees(String fileDest) {
        try {
            ArrayList<Employee> employees = new ArrayList<>();
            Scanner sc = new Scanner(new File(fileDest), "utf-8");
            // parsing a CSV file into the constructor of Scanner class
            sc.nextLine(); // skip the columns row.
            while (sc.hasNextLine()) {
                String[] line = sc.nextLine().split(" ");
                Employee employee = new Employee(
                        Integer.parseInt(line[0]),
                        line[1],
                        line[2],
                        Integer.parseInt(line[3]),
                        Double.parseDouble(line[4]),
                        Integer.parseInt(line[5]),
                        Integer.parseInt(line[6]),
                        Integer.parseInt(line[7]),
                        Integer.parseInt(line[8]),
                        Integer.parseInt(line[9]),
                        Integer.parseInt(line[10]));
                employees.add(employee);
            }
            sc.close();
            // closes the scanner
            return employees;
        } catch (FileNotFoundException ex) {
            return new ArrayList<Employee>();
        }
    }

    private static ArrayList<Employee> getAllEmployeesWithIds(String fileDest, int[] ids) {
        try {
            ArrayList<Employee> employees = new ArrayList<>();
            Scanner sc = new Scanner(new File(fileDest), "utf-8");
            // parsing a CSV file into the constructor of Scanner class
            sc.nextLine(); // skip the columns row.
            while (sc.hasNextLine()) {
                String[] line = sc.nextLine().split(" ");
                if (!contains(ids, Integer.parseInt(line[0]))) {
                    continue;
                }
                Employee employee = new Employee(
                        Integer.parseInt(line[0]),
                        line[1],
                        line[2],
                        Integer.parseInt(line[3]),
                        Double.parseDouble(line[4]),
                        Integer.parseInt(line[5]),
                        Integer.parseInt(line[6]),
                        Integer.parseInt(line[7]),
                        Integer.parseInt(line[8]),
                        Integer.parseInt(line[9]),
                        Integer.parseInt(line[10]));
                employees.add(employee);
            }
            sc.close();
            // closes the scanner
            return employees;
        } catch (FileNotFoundException ex) {
            return new ArrayList<Employee>();
        }
    }

    private static ArrayList<Employee> sortBySurname(ArrayList<Employee> employees) {
        Collections.sort(employees, new Comparator<Employee>() {
            @Override
            public int compare(Employee e1, Employee e2) {
                return e1.surname.compareTo(e2.surname);
            }
        });
        return employees;
    }

    private static String toJson(ArrayList<Employee> employees) {
        String json = "[";
        boolean isFirst = true;
        for (Employee employee : employees) {
            if (!isFirst) {
                json += ",";
            }
            isFirst = false;
            json += "{\"id\": " + employee.id + ", \"surname\":\"" + employee.surname + "\", \"name\":\""
                    + employee.name
                    + "\", \"number_of_hours\":" + employee.number_of_hours + ", \"hourly_rate\":\""
                    + employee.hourly_rate + "\", \"birth_day\":" + employee.birth_day + ", \"birth_month\":"
                    + employee.birth_month + ", \"birth_year\":" + employee.birth_year + ", \"job_day\":"
                    + employee.job_day + ", \"job_month\":" + employee.job_month + ", \"job_year\":" + employee.job_year
                    + ", \"value_of_work_done\":\"" + employee.value_of_work_done + "\"}";
        }
        json += "]";
        return json;
    }

    private static String getEmployeesAgeAndServiceLengthJson(ArrayList<Employee> employees) {
        String json = "[";
        boolean isFirst = true;
        for (Employee employee : employees) {
            if (!isFirst) {
                json += ",";
            }
            isFirst = false;
            json += "{\"id\": " + employee.id + ", \"age\": " + employee.getAge() + ", \"service_length\": "
                    + employee.getServiceLength() + " }";
        }
        json += "]";
        return json;
    }

    private static String getEmployeesOlderThanJson(ArrayList<Employee> employees, int age) {
        String json = "[";
        boolean isFirst = true;
        for (Employee employee : employees) {
            if (employee.getAge() < age) {
                continue;
            }
            if (!isFirst) {
                json += ",";
            }
            isFirst = false;
            json += "{\"id\": " + employee.id + " }";
        }
        json += "]";
        return json;
    }

    private static String getEmployeesTotalWorkAmountJson(ArrayList<Employee> employees) {
        String json = "";
        double totalWorkAmount = 0;
        for (Employee employee : employees) {
            totalWorkAmount += employee.value_of_work_done;
        }
        json = "{ \"total_work_amount\": " + (int) totalWorkAmount + " }";
        return json;
    }

    public static void main(String[] args) {
        String response = "";
        String API_ENDPOINT = args[0];
        switch (API_ENDPOINT) {

            case "get-all-employees":
                response = toJson(getAllEmployees(FILE_DEST));
                break;

            case "get-all-employees-sorted-by-surname":
                ArrayList<Employee> employees = getAllEmployees(FILE_DEST);
                employees = sortBySurname(employees);
                response = toJson(employees);
                break;

            case "get-employees-age-and-service":
                int[] ids = new int[args.length - 1];
                for (int i = 1; i < args.length; i++) {
                    ids[i - 1] = Integer.parseInt(args[i]);
                }
                ArrayList<Employee> limitedEmployees = getAllEmployeesWithIds(FILE_DEST, ids);
                response = getEmployeesAgeAndServiceLengthJson(limitedEmployees);
                break;

            case "get-employees-older-than":
                int age = Integer.parseInt(args[1]);
                int[] idsOlderThan = new int[args.length - 2];
                for (int i = 2; i < args.length; i++) {
                    idsOlderThan[i - 2] = Integer.parseInt(args[i]);
                }
                ArrayList<Employee> olderEmployees = getAllEmployeesWithIds(FILE_DEST, idsOlderThan);
                response = getEmployeesOlderThanJson(olderEmployees, age);
                break;

            case "get-employees-total-work-amount":
                int[] someIds = new int[args.length - 1];
                for (int i = 1; i < args.length; i++) {
                    someIds[i - 1] = Integer.parseInt(args[i]);
                }
                ArrayList<Employee> someEmployees = getAllEmployeesWithIds(FILE_DEST, someIds);
                response = getEmployeesTotalWorkAmountJson(someEmployees);
                break;

            // Default case
            default:
                // Print statement corresponding case
                System.err.println("400: No API endpoint stated.");
                return;
        }
        String encodeString = Base64.getEncoder().encodeToString(response.getBytes(StandardCharsets.UTF_8));
        System.out.print(encodeString);
    }

    private static boolean contains(final int[] arr, final int key) {
        return Arrays.stream(arr).anyMatch(i -> i == key);
    }
}