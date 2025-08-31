import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { debugAuthState, testFirestorePermissions } from '@/utils/auth-debug';
import { createUserDocument, ensureUserDocument, debugUserPermissions } from '@/utils/user-management';
import { shouldShowDebugTool } from '@/stores/admin-debug-store';
import { useAuth } from '@/hooks/useAuth';

interface AuthDebugPanelProps {
  isVisible?: boolean;
}

export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ isVisible = false }) => {
  const { currentUser: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(isVisible);
  const [permissionTest, setPermissionTest] = useState<string>('');

  // Check if component should be visible based on admin settings
  const shouldShow = shouldShowDebugTool('auth', authUser?.role)
  
  // If admin hasn't enabled auth debug panel, don't render anything
  if (!shouldShow) {
    return null
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          setUserDoc(userDocSnap.exists() ? userDocSnap.data() : null);
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const runPermissionTest = async () => {
    setPermissionTest('Testing permissions...');
    try {
      await testFirestorePermissions();
      setPermissionTest('✅ Permission test completed - check console');
    } catch (error: any) {
      setPermissionTest(`❌ Permission test failed: ${error.message}`);
    }
  };

  const runAuthDebug = () => {
    debugAuthState();
  };

  const runUserDebug = () => {
    debugUserPermissions();
  };

  const createMissingUserDoc = async () => {
    setPermissionTest('Creating user document...');
    try {
      const userDoc = await createUserDocument();
      if (userDoc) {
        setPermissionTest('✅ User document created successfully');
        // Refresh user doc state
        setUserDoc(userDoc);
      } else {
        setPermissionTest('❌ Failed to create user document');
      }
    } catch (error: any) {
      setPermissionTest(`❌ Error: ${error.message}`);
    }
  };

  const ensureUserDoc = async () => {
    setPermissionTest('Ensuring user document exists...');
    try {
      const userDoc = await ensureUserDocument();
      if (userDoc) {
        setPermissionTest('✅ User document verified/created');
        setUserDoc(userDoc);
      } else {
        setPermissionTest('❌ Failed to ensure user document');
      }
    } catch (error: any) {
      setPermissionTest(`❌ Error: ${error.message}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm"
        >
          🔍 Auth Debug
        </button>
      )}
      
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Firebase Auth Debug</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Status: </span>
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? '✅ Authenticated' : '❌ Not authenticated'}
              </span>
            </div>
            
            {user && (
              <>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">User ID: </span>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    {user.uid}
                  </code>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email: </span>
                  <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email Verified: </span>
                  <span className={user.emailVerified ? 'text-green-600' : 'text-orange-600'}>
                    {user.emailVerified ? '✅ Yes' : '⚠️ No'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">User Document: </span>
                  <span className={userDoc ? 'text-green-600' : 'text-red-600'}>
                    {userDoc ? '✅ Exists' : '❌ Missing'}
                  </span>
                </div>
                
                {userDoc && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Role: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {userDoc.role || 'No role set'}
                    </span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex flex-wrap gap-1 pt-2">
              <button
                onClick={runAuthDebug}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                Debug Auth
              </button>
              <button
                onClick={runPermissionTest}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                Test Permissions
              </button>
              <button
                onClick={runUserDebug}
                className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
              >
                User Debug
              </button>
              {user && !userDoc && (
                <button
                  onClick={createMissingUserDoc}
                  className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                >
                  Create User Doc
                </button>
              )}
              {user && (
                <button
                  onClick={ensureUserDoc}
                  className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                >
                  Ensure User Doc
                </button>
              )}
            </div>
            
            {permissionTest && (
              <div className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded">
                {permissionTest}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugPanel;
