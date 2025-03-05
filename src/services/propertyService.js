import { db, storage } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class PropertyService {
  constructor() {
    this.collection = collection(db, 'properties');
  }

  async getAllProperties() {
    try {
      const snapshot = await getDocs(this.collection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  async getPropertyById(propertyId) {
    try {
      const docRef = doc(this.collection, propertyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Property not found');
      }
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  async addProperty(propertyData) {
    try {
      // Handle image upload if present
      if (propertyData.image) {
        const imageRef = ref(storage, `properties/${Date.now()}_${propertyData.image.name}`);
        await uploadBytes(imageRef, propertyData.image);
        propertyData.imageUrl = await getDownloadURL(imageRef);
        delete propertyData.image;
      }

      const docRef = await addDoc(this.collection, {
        ...propertyData,
        createdAt: new Date(),
        isTokenized: false,
        totalSupply: 0
      });

      return {
        id: docRef.id,
        ...propertyData
      };
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  }

  async updateProperty(propertyId, propertyData) {
    try {
      const docRef = doc(this.collection, propertyId);
      await updateDoc(docRef, {
        ...propertyData,
        updatedAt: new Date()
      });

      return {
        id: propertyId,
        ...propertyData
      };
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(propertyId) {
    try {
      const docRef = doc(this.collection, propertyId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async getTokenizedProperties() {
    try {
      const q = query(this.collection, where("isTokenized", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tokenized properties:', error);
      throw error;
    }
  }

  async updateTokenizationStatus(propertyId, isTokenized, totalSupply = 0) {
    try {
      const docRef = doc(this.collection, propertyId);
      await updateDoc(docRef, {
        isTokenized,
        totalSupply,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating tokenization status:', error);
      throw error;
    }
  }

  async createProperty(propertyData, images) {
    try {
      const propertyId = doc(this.collection).id;
      const imageUrls = await this.uploadImages(propertyId, images);

      const property = {
        ...propertyData,
        id: propertyId,
        images: imageUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending', // pending, tokenized, sold
      };

      await setDoc(doc(this.collection, propertyId), property);
      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async uploadImages(propertyId, images) {
    try {
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageRef = ref(
          storage,
          `properties/${propertyId}/image-${i}`
        );
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  async getPropertiesByStatus(status) {
    try {
      const q = query(
        this.collection,
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error('Error getting properties by status:', error);
      throw error;
    }
  }

  async updatePropertyStatus(propertyId, status, tokenData = null) {
    try {
      const propertyRef = doc(this.collection, propertyId);
      const updateData = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (tokenData) {
        updateData.tokenData = tokenData;
      }

      await updateDoc(propertyRef, updateData);
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }

  async updatePropertyMetadata(propertyId, metadata) {
    try {
      const propertyRef = doc(this.collection, propertyId);
      await updateDoc(propertyRef, {
        ...metadata,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating property metadata:', error);
      throw error;
    }
  }

  generateTokenURI(property) {
    return {
      name: property.name,
      description: property.description,
      image: property.images[0],
      attributes: [
        {
          trait_type: 'Location',
          value: property.location,
        },
        {
          trait_type: 'Size',
          value: property.size,
        },
        {
          trait_type: 'Type',
          value: property.propertyType,
        },
        {
          trait_type: 'Year Built',
          value: property.yearBuilt,
        },
      ],
    };
  }
}

// Create a singleton instance
const propertyService = new PropertyService();

// Export a hook for easy use in components
export const usePropertyService = () => propertyService;

export default propertyService; 