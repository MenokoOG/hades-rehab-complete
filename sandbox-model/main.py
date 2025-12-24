from fastapi import FastAPI
from pydantic import BaseModel
import datetime

app = FastAPI()

class Forensic(BaseModel):
    forensic: dict

@app.get('/health')
def health():
    return {'status': 'ok', 'ts': datetime.datetime.utcnow().isoformat()}

@app.post('/replay')
def replay(payload: Forensic):
    forensic = payload.forensic
    result = {
        'replayed_at': datetime.datetime.utcnow().isoformat(),
        'original_ts': forensic.get('ts'),
        'verdict': 'safe',
        'echo_request': forensic.get('request'),
    }
    return result
