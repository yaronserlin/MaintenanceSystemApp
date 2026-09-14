import { sortToolsByLocalSerial, sortFaultsByOpenAndCreateDate, retry } from './index';

describe('sortToolsByLocalSerial', () => {
    it('sorts tools by localSerialNumber ascending', () => {
        const tools = [
            { localSerialNumber: '20', name: 'B' },
            { localSerialNumber: '10', name: 'A' },
        ];
        const sorted = sortToolsByLocalSerial(tools);
        expect(sorted.map(t => t.localSerialNumber)).toEqual(['10', '20']);
    });

    it('falls back to name comparison when serials are equal or missing', () => {
        const tools = [
            { localSerialNumber: '', name: 'Zebra' },
            { localSerialNumber: '', name: 'Apple' },
        ];
        const sorted = sortToolsByLocalSerial(tools);
        expect(sorted.map(t => t.name)).toEqual(['Apple', 'Zebra']);
    });

    it('does not mutate the original array', () => {
        const tools = [{ localSerialNumber: '2', name: 'B' }, { localSerialNumber: '1', name: 'A' }];
        const original = [...tools];
        sortToolsByLocalSerial(tools);
        expect(tools).toEqual(original);
    });
});

describe('sortFaultsByOpenAndCreateDate', () => {
    it('places open faults before closed ones', () => {
        const faults = [
            { status: 'closed', createdAt: '2024-01-01' },
            { status: 'open', createdAt: '2024-01-02' },
        ];
        const sorted = sortFaultsByOpenAndCreateDate(faults);
        expect(sorted[0].status).toBe('open');
    });

    it('orders same-status faults oldest first', () => {
        const faults = [
            { status: 'open', createdAt: '2024-02-01' },
            { status: 'open', createdAt: '2024-01-01' },
        ];
        const sorted = sortFaultsByOpenAndCreateDate(faults);
        expect(sorted[0].createdAt).toBe('2024-01-01');
    });

    it('does not mutate the original array', () => {
        const faults = [{ status: 'closed', createdAt: '2024-01-01' }, { status: 'open', createdAt: '2024-01-02' }];
        const original = [...faults];
        sortFaultsByOpenAndCreateDate(faults);
        expect(faults).toEqual(original);
    });
});

describe('retry', () => {
    it('resolves immediately when the function succeeds on the first try', async () => {
        const fn = jest.fn().mockResolvedValue('ok');
        const result = await retry(fn);
        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
        const fn = jest.fn()
            .mockRejectedValueOnce(new Error('transient'))
            .mockResolvedValueOnce('ok');
        const result = await retry(fn, 2, 1, 1);
        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting all retries', async () => {
        const err = new Error('permanent failure');
        const fn = jest.fn().mockRejectedValue(err);
        await expect(retry(fn, 1, 1, 1)).rejects.toThrow('permanent failure');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 401/403/404 errors', async () => {
        const err = { response: { status: 404 } };
        const fn = jest.fn().mockRejectedValue(err);
        await expect(retry(fn, 3, 1, 1)).rejects.toBe(err);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
