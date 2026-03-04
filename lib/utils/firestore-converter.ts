import { DocumentData, FirestoreDataConverter, PartialWithFieldValue, QueryDocumentSnapshot, SetOptions, Timestamp, WithFieldValue } from 'firebase/firestore';

/**
 * Crea un conversor tipado de Firestore que mapea automáticamente los Timestamps a Dates 
 * y viceversa, e inyecta el ID del documento.
 */
export const createConverter = <T extends { id?: string }>(): FirestoreDataConverter<T> => ({
  toFirestore: (modelObject: WithFieldValue<T> | PartialWithFieldValue<T>, options?: SetOptions): DocumentData => {
    // Al guardar, podemos quitar el id del cuerpo del documento para no duplicarlo
    const { id, ...rest } = modelObject as any;
    
    const parsedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(rest)) {
      // Ignorar valores undefined
      if (value === undefined) continue;
      
      if (value instanceof Date) {
        parsedData[key] = Timestamp.fromDate(value);
      } else {
        parsedData[key] = value;
      }
    }
    return parsedData as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>, options): T => {
    const data = snapshot.data(options);
    
    const parsedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Timestamp) {
        parsedData[key] = value.toDate();
      } else {
        parsedData[key] = value;
      }
    }

    return { id: snapshot.id, ...parsedData } as unknown as T;
  }
});
