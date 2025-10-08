// hooks/useAsaas.ts
import { useState } from 'react';

export function useAsaas() {
  const [loading, setLoading] = useState(false);

  const createPayment = async (paymentData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/asaas/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (subscriptionData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/asaas/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, createSubscription, loading };
}