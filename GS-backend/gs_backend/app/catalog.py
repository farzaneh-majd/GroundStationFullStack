"""Development telemetry catalog shared with the reconstructed web app.

These definitions keep local GraphQL development consistent with the frontend.
They are not the flight dictionary; replace them with an importer for the
mission's generated F Prime topology dictionary before live operations.
"""

DEFAULT_FIELDS = [
    ("1", "LED State", "OBC", "scalar", [
        {"key": "led_state", "name": "LED State", "format": "u8", "unit": None,
         "enumMap": {"0": "OFF", "1": "ON"}},
    ]),
    ("2", "IMU Data", "ADCS", "struct", [
        {"key": "accel_x", "name": "Acceleration X", "format": "f32", "unit": "m/s²"},
        {"key": "accel_y", "name": "Acceleration Y", "format": "f32", "unit": "m/s²"},
        {"key": "accel_z", "name": "Acceleration Z", "format": "f32", "unit": "m/s²"},
        {"key": "gyro_x", "name": "Gyroscope X", "format": "f32", "unit": "deg/s"},
        {"key": "gyro_y", "name": "Gyroscope Y", "format": "f32", "unit": "deg/s"},
        {"key": "gyro_z", "name": "Gyroscope Z", "format": "f32", "unit": "deg/s"},
    ]),
    ("3", "Battery Voltage", "EPS", "scalar", [
        {"key": "battery_voltage", "name": "Battery Voltage", "format": "f32", "unit": "V"},
    ]),
    ("4", "Solar Cell Voltages", "EPS", "struct", [
        {"key": "solar_cell_voltage_LL", "name": "Solar Cell Voltage LL", "format": "f32", "unit": "V"},
        {"key": "solar_cell_voltage_LU", "name": "Solar Cell Voltage LU", "format": "f32", "unit": "V"},
        {"key": "solar_cell_voltage_RL", "name": "Solar Cell Voltage RL", "format": "f32", "unit": "V"},
        {"key": "solar_cell_voltage_RU", "name": "Solar Cell Voltage RU", "format": "f32", "unit": "V"},
    ]),
    ("5", "Front Temperature and Humidity", "THERMAL", "struct", [
        {"key": "temperature", "name": "Temperature", "format": "f32", "unit": "°C"},
        {"key": "humidity", "name": "Humidity", "format": "u8", "unit": "%"},
    ]),
    ("6", "Back Temperature and Humidity", "THERMAL", "struct", [
        {"key": "temperature", "name": "Temperature", "format": "f32", "unit": "°C"},
        {"key": "humidity", "name": "Humidity", "format": "u8", "unit": "%"},
    ]),
    ("7", "Magnetometer", "ADCS", "struct", [
        {"key": "u_x", "name": "Magnetic Field X", "format": "f32", "unit": "T"},
        {"key": "u_y", "name": "Magnetic Field Y", "format": "f32", "unit": "T"},
        {"key": "u_z", "name": "Magnetic Field Z", "format": "f32", "unit": "T"},
        {"key": "headingDeg", "name": "Heading", "format": "f32", "unit": "deg"},
    ]),
    ("8", "Magnetometer Temperature", "ADCS", "scalar", [
        {"key": "magneto_meter", "name": "Magnetometer Temperature", "format": "f32", "unit": "°C"},
    ]),
]
