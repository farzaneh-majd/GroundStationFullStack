import struct
import pytest
from app.decoder import decode
from app.quality import evaluate
from app.catalog import DEFAULT_FIELDS
class Channel:
    name='Temperature';kind='scalar';endian='big'
    fields=[{'key':'temperature','name':'Temperature','format':'f32','unit':'C'}]

def test_decode_float():
    result=decode('3',struct.pack('>f',25.5).hex(),Channel())
    assert result['values']['temperature']==25.5

def test_short_packet():
    with pytest.raises(ValueError):decode('3','00',Channel())

def test_invalid_hex():
    with pytest.raises(ValueError):decode('3','Z1',Channel())

def test_quality():
    assert evaluate(90,{'warningHigh':80,'criticalHigh':100})=='WARNING'
    assert evaluate(110,{'warningHigh':80,'criticalHigh':100})=='CRITICAL'
    assert evaluate(50,{})=='UNKNOWN'

def test_catalog_matches_frontend_packet_ids():
    assert [row[0] for row in DEFAULT_FIELDS] == [str(value) for value in range(1, 9)]

def test_imu_definition_decodes_accelerometer_and_gyroscope():
    telemetry_id, name, _subsystem, kind, fields = DEFAULT_FIELDS[1]
    channel = type('Channel', (), {'name': name, 'kind': kind, 'endian': 'big', 'fields': fields})()
    values = (1.0, 2.0, 3.0, 4.0, 5.0, 6.0)
    result = decode(telemetry_id, struct.pack('>ffffff', *values).hex(), channel)
    assert result['values'] == dict(zip(('accel_x','accel_y','accel_z','gyro_x','gyro_y','gyro_z'), values))
