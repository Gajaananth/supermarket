import { describe, expect, it, vi } from 'vitest';
import { StructuredLogger } from '../src/common/logger/structured-logger';

describe('StructuredLogger', () => {
  it('writes JSON logs with timestamp, level, context, and message fields', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    new StructuredLogger().log('API started', 'Bootstrap');

    const record = JSON.parse(String(write.mock.calls[0][0]));
    expect(record).toMatchObject({
      level: 'log',
      context: 'Bootstrap',
      message: 'API started',
    });
    expect(Number.isNaN(Date.parse(record.timestamp))).toBe(false);
    write.mockRestore();
  });
});
