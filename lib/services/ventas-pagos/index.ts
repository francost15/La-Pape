import { CreateVentaPagoInput } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';

export const createVentaPago = async (pagoData: CreateVentaPagoInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ventas_pagos'), {
      ...pagoData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear pago de venta:', error);
    throw new Error('No se pudo crear el pago de venta');
  }
};
