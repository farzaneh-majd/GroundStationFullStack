import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
import strawberry
from strawberry.scalars import JSON
from sqlalchemy import select, delete
from app.db import Session
from app.models import Channel, RawPacket, Command, Satellite, Summary
from app.influx import history
from app.service import store_packet,send_command
from app.events import bus
from app.quality import evaluate
from app.decoder import decode

@strawberry.type
class Limits:
    warning_low: Optional[float]=None
    warning_high: Optional[float]=None
    critical_low: Optional[float]=None
    critical_high: Optional[float]=None

@strawberry.type
class Field:
    key: str
    name: str
    format: str
    unit: Optional[str]=None
    endian: Optional[str]=None
    enum_map: Optional[JSON]=None
    limits: Optional[Limits]=None

@strawberry.type
class Subsystem:
    id: str
    name: str
    description: Optional[str]=None

@strawberry.type
class ChannelType:
    id: strawberry.ID
    telemetry_id: strawberry.ID
    satellite_id: Optional[strawberry.ID]
    subsystem: str
    name: str
    description: Optional[str]
    kind: str
    endian: Optional[str]
    source: str
    sample_rate_hz: Optional[float]
    fields: list[Field]

@strawberry.type
class Catalog:
    version: str
    satellite_id: Optional[strawberry.ID]
    subsystems: list[Subsystem]
    channels: list[ChannelType]

@strawberry.type
class DecodedField:
    name: str
    value: JSON
    unit: Optional[str]=None
    format: Optional[str]=None

@strawberry.type
class Decoded:
    telemetry_id: strawberry.ID
    name: str
    kind: str
    raw_payload: str
    byte_length: int
    values: JSON
    fields: list[DecodedField]

@strawberry.type
class Packet:
    record_id: strawberry.ID
    time: datetime
    satellite_id: strawberry.ID
    telemetry_id: strawberry.ID
    payload: str
    decoded: Decoded

@strawberry.type
class Point:
    satellite_id: strawberry.ID
    channel_id: strawberry.ID
    telemetry_id: strawberry.ID
    field: str
    timestamp: datetime
    value: JSON
    unit: Optional[str]
    quality: str

@strawberry.type
class Series:
    field: str
    channel: ChannelType
    points: list[Point]

@strawberry.type
class CommandType:
    command_id: strawberry.ID
    satellite_id: strawberry.ID
    command_hex: str
    status: str
    time: datetime

@strawberry.type
class SatelliteType:
    id: strawberry.ID
    name: str

@strawberry.type
class SummaryType:
    satellite_id: strawberry.ID
    channel_id: strawberry.ID
    field: str
    window_start: datetime
    count: int
    mean: float
    minimum: float
    maximum: float
    stddev: float

@strawberry.input
class RawTelemetryFilterInput:
    satellite_id: Optional[strawberry.ID]=None
    telemetry_id: Optional[strawberry.ID]=None

@strawberry.input
class RawTelemetryPacketInput:
    satellite_id: strawberry.ID
    telemetry_id: strawberry.ID
    payload: str
    timestamp: Optional[datetime]=None
    time_precision: Optional[str]=None

@strawberry.input
class TelemetryHistoryInput:
    satellite_id: strawberry.ID
    channel_id: strawberry.ID
    field: str
    from_: datetime = strawberry.field(name='from')
    to: datetime
    limit: int=1000

@strawberry.input
class SendCommandInput:
    satellite_id: strawberry.ID
    command_hex: str

def field_type(f):
    lim=f.get('limits')
    return Field(key=f['key'],name=f.get('name',f['key']),format=f['format'],unit=f.get('unit'),endian=f.get('endian'),enum_map=f.get('enumMap'),limits=Limits(**{ {'warningLow':'warning_low','warningHigh':'warning_high','criticalLow':'critical_low','criticalHigh':'critical_high'}[k]:v for k,v in lim.items()}) if lim else None)

def channel_type(c):
    return ChannelType(id=c.id,telemetry_id=c.telemetry_id,satellite_id=c.satellite_id,subsystem=c.subsystem,name=c.name,description=None,kind=c.kind,endian=c.endian,source=c.source,sample_rate_hz=c.sample_rate_hz,fields=[field_type(f) for f in c.fields])

def decoded_type(d):
    return Decoded(telemetry_id=d['telemetryId'],name=d['name'],kind=d['kind'],raw_payload=d['rawPayload'],byte_length=d['byteLength'],values=d['values'],fields=[DecodedField(**f) for f in d['fields']])

def packet_type(p):
    if isinstance(p,dict):
        return Packet(record_id=p['recordId'],time=p['time'],satellite_id=p['satelliteId'],telemetry_id=p['telemetryId'],payload=p['payload'],decoded=decoded_type(p['decoded']))
    return Packet(record_id=p.record_id,time=p.time,satellite_id=p.satellite_id,telemetry_id=p.telemetry_id,payload=p.payload,decoded=decoded_type(p.decoded))

def point_type(p):
    return Point(
        satellite_id=p['satelliteId'],
        channel_id=p['channelId'],
        telemetry_id=p['telemetryId'],
        field=p['field'],
        timestamp=p['timestamp'],
        value=p['value'],
        unit=p.get('unit'),
        quality=p['quality'],
    )
def command_type(c): return CommandType(command_id=c.command_id,satellite_id=c.satellite_id,command_hex=c.command_hex,status=c.status,time=c.time)

@strawberry.type
class Query:
    @strawberry.field
    async def satellites(self)->list[SatelliteType]:
        async with Session() as s:
            rows=(await s.execute(select(Satellite).order_by(Satellite.id))).scalars().all()
        return [SatelliteType(id=row.id,name=row.name) for row in rows]

    @strawberry.field
    async def telemetry_catalog(self,satellite_id:Optional[strawberry.ID]=None)->Catalog:
        async with Session() as s:
            query=select(Channel)
            if satellite_id: query=query.where(Channel.satellite_id==str(satellite_id))
            channels=(await s.execute(query)).scalars().all()
        subs=sorted(set(c.subsystem for c in channels))
        return Catalog(version='1.0',satellite_id=str(satellite_id) if satellite_id else None,subsystems=[Subsystem(id=x,name=x) for x in subs],channels=[channel_type(c) for c in channels])

    @strawberry.field
    async def telemetry_history(self,input:TelemetryHistoryInput)->Series:
        async with Session() as s:
            c=await s.get(Channel,str(input.channel_id))
        if not c or c.satellite_id!=str(input.satellite_id): raise ValueError('Channel not found for satellite')
        if input.field not in [f['key'] for f in c.fields]: raise ValueError('Unknown field')
        if input.from_>=input.to: raise ValueError('Invalid time range')
        rows=await history(c.satellite_id,c.id,input.field,input.from_.isoformat(),input.to.isoformat(),input.limit)
        definition=next(f for f in c.fields if f['key']==input.field)
        points=[Point(satellite_id=c.satellite_id,channel_id=c.id,telemetry_id=c.telemetry_id,field=input.field,timestamp=x['timestamp'],value=x['value'],unit=definition.get('unit'),quality=evaluate(x['value'],definition.get('limits'))) for x in rows]
        return Series(field=input.field,channel=channel_type(c),points=points)

    @strawberry.field
    async def raw_telemetry_packets(self,filter:Optional[RawTelemetryFilterInput]=None,limit:int=200)->list[Packet]:
        q=select(RawPacket).order_by(RawPacket.time.desc()).limit(max(1,min(limit,1000)))
        if filter:
            if filter.satellite_id:q=q.where(RawPacket.satellite_id==str(filter.satellite_id))
            if filter.telemetry_id:q=q.where(RawPacket.telemetry_id==str(filter.telemetry_id))
        async with Session() as s: rows=(await s.execute(q)).scalars().all()
        return [packet_type(x) for x in rows]

    @strawberry.field
    async def commands(self,satellite_id:Optional[strawberry.ID]=None,limit:int=20)->list[CommandType]:
        q=select(Command).order_by(Command.time.desc()).limit(max(1,min(limit,500)))
        if satellite_id:q=q.where(Command.satellite_id==str(satellite_id))
        async with Session() as s: rows=(await s.execute(q)).scalars().all()
        return [command_type(x) for x in rows]

    @strawberry.field
    async def telemetry_summaries(self,satellite_id:strawberry.ID,channel_id:Optional[strawberry.ID]=None,field:Optional[str]=None,start:Optional[datetime]=None,end:Optional[datetime]=None,limit:int=1000)->list[SummaryType]:
        q=select(Summary).where(Summary.satellite_id==str(satellite_id))
        if channel_id:q=q.where(Summary.channel_id==str(channel_id))
        if field:q=q.where(Summary.field==field)
        if start:q=q.where(Summary.window_start>=start)
        if end:q=q.where(Summary.window_start<end)
        q=q.order_by(Summary.window_start.desc()).limit(max(1,min(limit,10000)))
        async with Session() as s: rows=(await s.execute(q)).scalars().all()
        return [SummaryType(satellite_id=x.satellite_id,channel_id=x.channel_id,field=x.field,window_start=x.window_start,count=x.count,mean=x.mean,minimum=x.minimum,maximum=x.maximum,stddev=x.stddev) for x in reversed(rows)]

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_raw_telemetry_packet(self,input:RawTelemetryPacketInput)->Packet:
        return packet_type(await store_packet(str(input.satellite_id),str(input.telemetry_id),input.payload,input.timestamp))

    @strawberry.mutation
    async def update_raw_telemetry_packet(self,record_id:strawberry.ID,input:RawTelemetryPacketInput)->Packet:
        # Updates are intended for test records; reprocessing writes a fresh timeseries point.
        async with Session() as s:
            record=await s.get(RawPacket,str(record_id))
            if not record: raise ValueError('Packet not found')
            await s.delete(record);await s.commit()
        return packet_type(await store_packet(str(input.satellite_id),str(input.telemetry_id),input.payload,input.timestamp,record_id=str(record_id)))

    @strawberry.mutation
    async def delete_raw_telemetry_packet(self,record_id:strawberry.ID)->bool:
        # Deletes the packet metadata; immutable telemetry history is not erased.
        async with Session() as s:
            result=await s.execute(delete(RawPacket).where(RawPacket.record_id==str(record_id)))
            await s.commit()
            return result.rowcount>0

    @strawberry.mutation
    async def send_command(self,input:SendCommandInput)->CommandType:
        return command_type(await send_command(str(input.satellite_id),input.command_hex))

@strawberry.type
class Subscription:
    @strawberry.subscription
    async def raw_telemetry(self,satellite_id:Optional[strawberry.ID]=None,telemetry_id:Optional[strawberry.ID]=None)->AsyncGenerator[Packet,None]:
        async for item in bus.stream('raw'):
            if satellite_id and item['satelliteId']!=str(satellite_id): continue
            if telemetry_id and item['telemetryId']!=str(telemetry_id): continue
            yield packet_type(item)

    @strawberry.subscription
    async def telemetry_point(self,satellite_id:strawberry.ID,channel_id:Optional[strawberry.ID]=None,field:Optional[str]=None)->AsyncGenerator[Point,None]:
        async for item in bus.stream('point'):
            if item['satelliteId']!=str(satellite_id): continue
            if channel_id and item['channelId']!=str(channel_id): continue
            if field and item['field']!=field: continue
            yield point_type(item)

schema=strawberry.Schema(query=Query,mutation=Mutation,subscription=Subscription)
