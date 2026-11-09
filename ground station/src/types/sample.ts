export type SampleInput = {
  tlmId?: string;
  sampleType?: string;
  dataHex?: string;
  value?: number;
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
  sync?: string;
};

export type StoredSample = {
  recordId: string;
  time: string;
  sampleType: string;
  tlmId: string;
  sync: string;
  len: number;
  payloadHex: string;
  dataHex: string;
  crc: string;
  value?: number;
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
};
