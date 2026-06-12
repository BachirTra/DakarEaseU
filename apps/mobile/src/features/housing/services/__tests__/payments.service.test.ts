import { processPayment } from '../payments.service';

describe('processPayment (simulated seam)', () => {
  it('resolves with a success status and an echoed reference for any method', async () => {
    const result = await processPayment('wave', 255000, 'booking-ref-123');
    expect(result.status).toBe('success');
    expect(result.reference).toBe('booking-ref-123');
    expect(result.method).toBe('wave');
    expect(result.amount).toBe(255000);
  });

  it('supports orange_money and card the same way', async () => {
    await expect(processPayment('orange_money', 1000, 'ref-a')).resolves.toMatchObject({
      status: 'success',
      method: 'orange_money',
    });
    await expect(processPayment('card', 1000, 'ref-b')).resolves.toMatchObject({
      status: 'success',
      method: 'card',
    });
  });
});
