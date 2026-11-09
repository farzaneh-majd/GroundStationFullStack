"""Send a demo SAT-A battery-voltage packet to the secured ingestion endpoint."""
import os,struct,urllib.request,json
body=json.dumps({'satellite_id':'SAT-A','telemetry_id':'3','payload':struct.pack('>f',7.8).hex()}).encode()
req=urllib.request.Request('http://localhost:8000/ingest/packet',body,headers={'Content-Type':'application/json','X-API-Key':os.environ['INGEST_API_KEY']})
print(urllib.request.urlopen(req).read().decode())
