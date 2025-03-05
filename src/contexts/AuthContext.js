import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  where
} from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || '',
            role: 'user',
            isActive: true,
            createdAt: new Date()
          });
          setCurrentUser({
            ...user,
            role: 'user',
            isActive: true
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role: 'user',
        isActive: true,
        createdAt: new Date()
      });
      return user;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  };

  const signin = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      console.error('Error in signin:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error in signout:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error in reset password:', error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const getUsersByRole = async (role) => {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where("role", "==", role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    signin,
    signOut,
    resetPassword,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getUsersByRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 