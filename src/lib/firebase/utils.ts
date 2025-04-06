import { Timestamp } from 'firebase/firestore';

/**
 * Sanitizes Firestore data to make it serializable
 * Converts Timestamps to ISO strings and handles nested objects
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData) as unknown as T;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as unknown as T;
  }

  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // Handle Firestore Timestamp objects
      if (value instanceof Timestamp) {
        result[key] = value.toDate().toISOString();
      } 
      // Handle nested objects or arrays with potential Timestamps
      else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeFirestoreData(value);
      } 
      // Handle primitive values
      else {
        result[key] = value;
      }
    });
    
    return result as unknown as T;
  }

  return data;
}
