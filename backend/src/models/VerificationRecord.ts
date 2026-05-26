import mongoose, { Schema, Document } from 'mongoose';

export type VerificationStatus = 'queued' | 'processing' | 'cross-validating' | 'blockchain-hashing' | 'completed' | 'failed';
export type VerificationType = 'identity' | 'employment' | 'education' | 'criminal' | 'reference' | 'address' | 'credit';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface IVerificationRecord extends Document {
  recordId: string;
  userId: string;
  candidateName: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  confidenceScore: number;
  riskLevel: RiskLevel;
  completionProgress: number;
  stages: IVerificationStage[];
  result: string;
  notes: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface IVerificationStage {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

const VerificationStageSchema = new Schema<IVerificationStage>({
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'failed'], default: 'pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number },
});

const VerificationRecordSchema = new Schema<IVerificationRecord>(
  {
    recordId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    candidateName: { type: String, required: true },
    verificationType: {
      type: String,
      enum: ['identity', 'employment', 'education', 'criminal', 'reference', 'address', 'credit'],
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'cross-validating', 'blockchain-hashing', 'completed', 'failed'],
      default: 'queued',
    },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    completionProgress: { type: Number, default: 0, min: 0, max: 100 },
    stages: [VerificationStageSchema],
    result: { type: String, default: '' },
    notes: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const VerificationRecord = mongoose.model<IVerificationRecord>(
  'VerificationRecord',
  VerificationRecordSchema
);
