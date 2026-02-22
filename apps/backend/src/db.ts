import { User, Session, OnboardingDraft, VerificationStatus } from "@mal-assessment/shared";

// In-memory storage for M1 (expandable for M2+ persistence)
export interface StoredUser extends User {
  passwordHash: string; // In real app, use bcrypt
}

interface StoredSession {
  userId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
}

interface StoredSubmission {
  submissionId: string;
  userId: string;
  draft: OnboardingDraft;
  submittedAt: Date;
}

interface StoredVerification {
  userId: string;
  status: VerificationStatus;
  updatedAt: Date;
  reasons: string[];
}

class Database {
  private users: Map<string, StoredUser> = new Map();
  private sessions: Map<string, StoredSession> = new Map();
  private submissions: Map<string, StoredSubmission> = new Map();
  private verifications: Map<string, StoredVerification> = new Map();
  private nextUserId = 1;
  private nextSubmissionId = 1;

  // ============ USER METHODS ============
  createUser(email: string, password: string, fullName: string): StoredUser {
    const id = `USR-${String(this.nextUserId++).padStart(3, "0")}`;
    const user: StoredUser = {
      id,
      email,
      fullName,
      passwordHash: password, // In real app: bcrypt.hashSync(password, 10)
    };
    this.users.set(id, user);
    // Initialize verification status
    this.verifications.set(id, {
      userId: id,
      status: "NOT_STARTED",
      updatedAt: new Date(),
      reasons: [],
    });
    return user;
  }

  getUserByEmail(email: string): StoredUser | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  getUserById(userId: string): User | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // ============ SESSION METHODS ============
  createSession(userId: string): Session {
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    this.sessions.set(accessToken, {
      userId,
      refreshToken,
      accessToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  validateAccessToken(accessToken: string): { userId: string; isExpired: boolean } | null {
    const session = this.sessions.get(accessToken);
    if (!session) return null;
    const isExpired = session.expiresAt < new Date();
    return { userId: session.userId, isExpired };
  }

  refreshAccessToken(refreshToken: string): Session | null {
    const session = Array.from(this.sessions.values()).find(
      (s) => s.refreshToken === refreshToken
    );
    if (!session) return null;

    const newAccessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Remove old session
    this.sessions.delete(session.accessToken);

    // Create new session
    this.sessions.set(newAccessToken, {
      userId: session.userId,
      refreshToken: refreshToken,
      accessToken: newAccessToken,
      expiresAt: newExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken,
      expiresAt: newExpiresAt.toISOString(),
    };
  }

  // ============ SUBMISSION METHODS ============
  submitOnboarding(userId: string, draft: OnboardingDraft): string {
    const submissionId = `SUB-${String(this.nextSubmissionId++).padStart(3, "0")}`;
    this.submissions.set(submissionId, {
      submissionId,
      userId,
      draft,
      submittedAt: new Date(),
    });

    // Update verification status
    const verification = this.verifications.get(userId);
    if (verification) {
      verification.status = "IN_PROGRESS";
      verification.updatedAt = new Date();
      verification.reasons = [];
    }

    return submissionId;
  }

  // ============ VERIFICATION METHODS ============
  getVerificationStatus(userId: string) {
    const verification = this.verifications.get(userId);
    if (!verification) {
      return {
        status: "NOT_STARTED" as VerificationStatus,
        updatedAt: new Date().toISOString(),
        details: { reasons: [] },
      };
    }
    return {
      status: verification.status,
      updatedAt: verification.updatedAt.toISOString(),
      details: { reasons: verification.reasons },
    };
  }

  // ============ SEED DATA ============
  seedTestUser() {
    this.createUser("jane.doe@example.com", "password123", "Jane Doe");
  }
}

export const db = new Database();

// Seed with test data for M1
db.seedTestUser();
