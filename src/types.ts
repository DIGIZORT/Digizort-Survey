export interface OpinionValue {
  id: string;
  fullName: string;
  answer: "Yes" | "No";
  opinion: string;
  createdAt: any; // Can be a Firestore timestamp or date string in formatted layout
}

export type OperationType = "create" | "update" | "delete" | "list" | "get" | "write";

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
