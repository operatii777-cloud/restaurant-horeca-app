export type InterfacePin = {
  interface: string;
  hasPin: boolean;
  pin: string | null;
  pinMask: string | null;
  lastRotatedAt: string | null;
  policyVersion: number;
  rotatedBy: string | null;
  algorithm: string;
  legacy?: boolean;
};

export type InterfacePinResponse = {
  pins: InterfacePin[];
};


