import { Controller, Post, Body, Req, Res, Get, Headers } from '@nestjs/common';
import { ForensicsService } from './forensics.service';
import { TriageService } from './triage.service';
import axios from 'axios';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import util from 'util';

async function verifyJwtWithJwks(token: string) {
  const jwksUrl = process.env.SUPABASE_JWKS_URL || '';
  if (!jwksUrl) {
    // Fallback: decode without verification (NOT FOR PROD)
    try {
      const dec: any = jwt.decode(token);
      return dec;
    } catch (e) { return null; }
  }
  const client = jwksClient({ jwksUri: jwksUrl, timeout: 30000 });
  const getSigningKey = util.promisify(client.getSigningKey);
  const decodedHeader: any = jwt.decode(token, { complete: true })?.header;
  if (!decodedHeader) return null;
  try {
    const key = await getSigningKey(decodedHeader.kid);
    const pub = key.getPublicKey();
    const verified = jwt.verify(token, pub, { algorithms: ['RS256'] });
    return verified;
  } catch (e) {
    console.error('JWT verification failed', e);
    return null;
  }
}

@Controller()
export class ProxyController {
  constructor(private readonly forensic: ForensicsService, private readonly triage: TriageService) {}

  @Post('api/proxy')
  async proxy(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    const sandboxUrl = process.env.SANDBOX_URL || 'http://localhost:8000/replay';
    const capture = {
      ts: new Date().toISOString(),
      request: {
        headers: req.headers,
        body
      },
      meta: {
        source: 'proxy'
      }
    };
    const id = await this.forensic.writeCapture(capture);
    try {
      const r = await axios.post(sandboxUrl, { forensic: capture }, { timeout: 10000 });
      const out = r.data;
      await this.forensic.appendResponse(id, out);
      return res.json(out);
    } catch (err: any) {
      const errorObj = { error: String(err?.message || err) };
      await this.forensic.appendResponse(id, errorObj);
      return res.status(502).json(errorObj);
    }
  }

  @Get('forensics')
  async list() {
    return await this.forensic.listCaptures();
  }

  // Triage endpoint expects Authorization: Bearer <supabase_jwt>
  @Post('triage')
  async triage(@Headers('authorization') auth: string, @Body() body: any) {
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : auth;
    if (!token) return { error: 'missing token' };
    const decoded: any = await verifyJwtWithJwks(token);
    if (!decoded) return { error: 'invalid token' };
    const userId = decoded.sub || decoded.user_id || decoded?.id || null;
    // RBAC check: ensure user has role 'operator' or 'admin' in user_roles table
    const role = await this.triage.getUserRole(userId);
    if (!role || (role !== 'operator' && role !== 'admin')) {
      return { error: 'insufficient role' };
    }
    const saved = await this.triage.saveTriage({ forensic_id: body.forensicId, user_id: userId, tags: body.tags, comment: body.comment });
    return { ok: true, saved };
  }

  @Get('triage/recent')
  async recentTriage() {
    return await this.triage.supabase.from('triage_events').select().order('created_at', { ascending: false }).limit(50);
  }
}
