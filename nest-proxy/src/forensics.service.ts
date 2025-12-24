import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import mongoose from 'mongoose';

const ForensicSchema = new mongoose.Schema({
  ts: { type: Date, default: Date.now },
  request: { type: mongoose.Schema.Types.Mixed },
  response: { type: mongoose.Schema.Types.Mixed },
  meta: { type: mongoose.Schema.Types.Mixed },
  tags: { type: [String], default: [] },
  triage: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { strict: false });

@Injectable()
export class ForensicsService implements OnModuleInit, OnModuleDestroy {
  private Model: mongoose.Model<any>;
  private conn?: typeof mongoose;

  constructor() {
    this.Model = mongoose.model('Forensic', ForensicSchema);
  }

  async onModuleInit() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hades';
    console.log('Connecting to MongoDB at', uri);
    this.conn = mongoose;
    await mongoose.connect(uri, { dbName: 'hades' });
    console.log('Connected to MongoDB');
  }

  async onModuleDestroy() {
    try { await mongoose.disconnect(); } catch (e) {}
  }

  async writeCapture(obj: any) {
    const doc = new this.Model(obj);
    await doc.save();
    return doc._id;
  }

  async appendResponse(idOrObj: any, response: any) {
    if (!idOrObj) return null;
    if (typeof idOrObj === 'string' || idOrObj._id) {
      const id = typeof idOrObj === 'string' ? idOrObj : idOrObj._id;
      return await this.Model.findByIdAndUpdate(id, { $set: { response } }, { new: true }).lean();
    }
    return null;
  }

  async listCaptures(limit = 200) {
    return await this.Model.find().sort({ ts: -1 }).limit(limit).lean();
  }
}
