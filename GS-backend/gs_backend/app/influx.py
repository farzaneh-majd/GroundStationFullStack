from datetime import datetime, timezone
import csv
import io
import aiohttp
from influxdb_client import Point, WritePrecision
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
from app.config import settings

CONFIG = {
 'SAT-A': (settings.influx_a_url,settings.influx_a_token,settings.influx_a_org,settings.influx_a_bucket),
 'SAT-B': (settings.influx_b_url,settings.influx_b_token,settings.influx_b_org,settings.influx_b_bucket),
}
def config(satellite_id):
    if satellite_id not in CONFIG: raise ValueError('Satellite must be SAT-A or SAT-B')
    return CONFIG[satellite_id]

def client(satellite_id):
    url,token,org,bucket=config(satellite_id)
    return InfluxDBClientAsync(url=url,token=token,org=org,timeout=15000)

async def ping(satellite_id):
    async with client(satellite_id) as db:
        return await db.ping()

async def _query_flux(satellite_id, query):
    """Run a Flux query without the optional aiocsv dependency.

    InfluxDB returns annotated CSV.  Parsing it here keeps the runtime image
    self-contained and avoids making historical queries depend on an optional
    package used internally by influxdb-client's async query helper.
    """
    url,token,org,_=config(satellite_id)
    headers={
        'Authorization':f'Token {token}',
        'Accept':'application/csv',
        'Content-Type':'application/vnd.flux; charset=utf-8',
    }
    timeout=aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(f'{url.rstrip("/")}/api/v2/query',params={'org':org},headers=headers,data=query) as response:
            body=await response.text()
            if response.status>=400:
                raise RuntimeError(f'InfluxDB query failed ({response.status}): {body[:500]}')
    rows=[];header=None
    for row in csv.reader(io.StringIO(body)):
        if not row or row[0].startswith('#'):continue
        if '_time' in row and '_value' in row:
            header=row
            continue
        if header and len(row)==len(header):
            rows.append(dict(zip(header,row)))
    return rows

async def write_points(satellite_id,channel_id,telemetry_id,values,timestamp):
    _,_,org,bucket=config(satellite_id)
    points=[]
    for field,value in values.items():
        if isinstance(value,(int,float)) and not isinstance(value,bool):
            points.append(Point('telemetry').tag('satellite_id',satellite_id).tag('channel_id',channel_id).tag('telemetry_id',telemetry_id).tag('field',field).field('value',float(value)).time(timestamp,WritePrecision.NS))
    if not points: return
    async with client(satellite_id) as db:
        await db.write_api().write(bucket=bucket,org=org,record=points)

def _flux_string(value: str) -> str:
    # Escape user input as a Flux string literal; no arbitrary Flux query exposure.
    import json
    return json.dumps(value)

async def history(satellite_id,channel_id,field,start,end,limit=1000):
    _,_,org,bucket=config(satellite_id)
    limit=max(1,min(limit,10000))
    query=(f'from(bucket: {_flux_string(bucket)}) '
           f'|> range(start: time(v: {_flux_string(start)}), stop: time(v: {_flux_string(end)})) '
           f'|> filter(fn: (r) => r._measurement == "telemetry" and r.channel_id == {_flux_string(channel_id)} and r.field == {_flux_string(field)}) '
           f'|> sort(columns: ["_time"], desc: true) |> limit(n: {limit})')
    records=await _query_flux(satellite_id,query)
    rows=[{'timestamp':datetime.fromisoformat(r['_time'].replace('Z','+00:00')),'value':float(r['_value'])} for r in records]
    return list(reversed(rows))

async def minute_summaries(satellite_id,start,end):
    _,_,org,bucket=config(satellite_id)
    base=(f'from(bucket: {_flux_string(bucket)}) '
          f'|> range(start: time(v: {_flux_string(start)}), stop: time(v: {_flux_string(end)})) '
          '|> filter(fn: (r) => r._measurement == "telemetry" and r._field == "value") '
          '|> group(columns: ["channel_id","field"]) ')
    result={}
    for name,fn in [('mean','mean'),('minimum','min'),('maximum','max'),('count','count'),('stddev','stddev')]:
        query=base+f'|> aggregateWindow(every: 1m, fn: {fn}, createEmpty: false)'
        records=await _query_flux(satellite_id,query)
        for rec in records:
            key=(rec['channel_id'],rec['field'],datetime.fromisoformat(rec['_time'].replace('Z','+00:00')))
            result.setdefault(key,{})[name]=float(rec['_value'])
    return result
