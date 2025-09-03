import { logger } from "@/utils/logger";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export interface UserDocument {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive';
  created: any;
  updated: any;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  preferences?: {
    language: 'en' | 'ar';
    currency: 'OMR' | 'USD' | 'SAR';
    newsletter: boolean;
  };
}

/**
 * Creates a user document in Firestore with default values
 * Call this after successful user registration or first login
 */
export const createUserDocument = async (
  uid?: string,
  additionalData: Partial<UserDocument> = {}
): Promise<UserDocument | null> => {
  try {
    const user = auth.currentUser;
    const userId = uid || user?.uid;
    
    if (!userId) {
      throw new Error('No user ID provided and no authenticated user found');
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Check if user document already exists
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      logger.log('User document already exists');
      return { id: userDoc.id, ...userDoc.data() } as unknown as UserDocument;
    }

    // Create new user document with default values
    const userData: UserDocument = {
      uid: userId,
      email: user.email || '',
      displayName: user.displayName || '',
      role: 'customer', // Default role
      status: 'active',
      created: serverTimestamp(),
      updated: serverTimestamp(),
      profile: {
        firstName: '',
        lastName: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'OM' // Default to Oman
        }
      },
      preferences: {
        language: 'en',
        currency: 'OMR',
        newsletter: false
      },
      ...additionalData
    };

    await setDoc(userDocRef, userData);
    
    logger.log('✅ User document created successfully');
    toast.success('User profile created successfully');
    
    return userData;
  } catch (error: any) {
    logger.error('❌ Error creating user document:', error);
    toast.error(`Failed to create user profile: ${error.message}`);
    return null;
  }
};

/**
 * Ensures user document exists, creates it if missing
 */
export const ensureUserDocument = async (): Promise<UserDocument | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      logger.warn('No authenticated user found');
      return null;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as unknown as UserDocument;
    } else {
      logger.log('User document missing, creating...');
      return await createUserDocument();
    }
  } catch (error: any) {
    logger.error('Error ensuring user document:', error);
    return null;
  }
};

/**
 * Updates user document with new data
 */
export const updateUserDocument = async (
  data: Partial<UserDocument>
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const updateData = {
      ...data,
      updated: serverTimestamp()
    };

    await setDoc(userDocRef, updateData, { merge: true });
    
    logger.log('✅ User document updated successfully');
    toast.success('Profile updated successfully');
    
    return true;
  } catch (error: any) {
    logger.error('❌ Error updating user document:', error);
    toast.error(`Failed to update profile: ${error.message}`);
    return false;
  }
};

/**
 * Gets user document from Firestore
 */
export const getUserDocument = async (uid?: string): Promise<UserDocument | null> => {
  try {
    const user = auth.currentUser;
    const userId = uid || user?.uid;
    
    if (!userId) {
      logger.warn('No user ID provided');
      return null;
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as unknown as UserDocument;
    } else {
      logger.warn('User document does not exist');
      return null;
    }
  } catch (error: any) {
    logger.error('Error getting user document:', error);
    return null;
  }
};

/**
 * Debug function to check user permissions and document status
 */
export const debugUserPermissions = async () => {
  console.group('🔍 User Permissions Debug');
  
  try {
    const user = auth.currentUser;
    if (!user) {
      logger.warn('⚠️ No authenticated user');
      return;
    }

    logger.log('Current User:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName
    });

    // Check user document
    const userDoc = await getUserDocument();
    if (userDoc) {
      logger.log('✅ User Document:', userDoc);
      logger.log('User Role:', userDoc.role);
      logger.log('User Status:', userDoc.status);
    } else {
      logger.warn('⚠️ User document missing');
      logger.log('Creating user document...');
      const newUserDoc = await createUserDocument();
      if (newUserDoc) {
        logger.log('✅ User document created:', newUserDoc);
      } else {
        logger.error('❌ Failed to create user document');
      }
    }

    // Test token claims
    try {
      const tokenResult = await user.getIdTokenResult();
      logger.log('Token Claims:', tokenResult.claims);
    } catch (error) {
      logger.error('❌ Error getting token claims:', error);
    }

  } catch (error) {
    logger.error('❌ Debug error:', error);
  } finally {
    console.groupEnd();
  }
};
