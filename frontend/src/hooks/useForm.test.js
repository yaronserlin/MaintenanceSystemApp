import { renderHook, act } from '@testing-library/react';
import useForm from './useForm';

function makeEvent(overrides = {}) {
    return {
        preventDefault: jest.fn(),
        target: { name: 'field', value: '', type: 'text', checked: false, files: null, ...overrides },
    };
}

describe('useForm', () => {
    it('initializes values, errors, and isSubmitting from initialValues', () => {
        const { result } = renderHook(() => useForm({ initialValues: { name: 'A' } }));
        expect(result.current.values).toEqual({ name: 'A' });
        expect(result.current.errors).toEqual({});
        expect(result.current.isSubmitting).toBe(false);
    });

    it('handleChange updates text field values', () => {
        const { result } = renderHook(() => useForm({ initialValues: { name: '' } }));
        act(() => {
            result.current.handleChange(makeEvent({ name: 'name', value: 'Jane', type: 'text' }));
        });
        expect(result.current.values.name).toBe('Jane');
    });

    it('handleChange stores the checked boolean for checkbox inputs', () => {
        const { result } = renderHook(() => useForm({ initialValues: { agree: false } }));
        act(() => {
            result.current.handleChange(makeEvent({ name: 'agree', type: 'checkbox', checked: true }));
        });
        expect(result.current.values.agree).toBe(true);
    });

    it('handleChange stores the FileList for file inputs', () => {
        const { result } = renderHook(() => useForm({ initialValues: { file: null } }));
        const fakeFiles = [new Blob(['x'])];
        act(() => {
            result.current.handleChange(makeEvent({ name: 'file', type: 'file', files: fakeFiles }));
        });
        expect(result.current.values.file).toBe(fakeFiles);
    });

    it('handleSubmit sets errors and skips onSubmit when validation fails', async () => {
        const onSubmit = jest.fn();
        const validate = jest.fn(() => ({ name: 'Required' }));
        const { result } = renderHook(() => useForm({ initialValues: { name: '' }, validate, onSubmit }));

        await act(async () => {
            await result.current.handleSubmit(makeEvent());
        });

        expect(result.current.errors).toEqual({ name: 'Required' });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('handleSubmit calls onSubmit and toggles isSubmitting when validation passes', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const validate = jest.fn(() => ({}));
        const { result } = renderHook(() => useForm({ initialValues: { name: 'Jane' }, validate, onSubmit }));

        await act(async () => {
            await result.current.handleSubmit(makeEvent());
        });

        expect(onSubmit).toHaveBeenCalledWith({ name: 'Jane' });
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.errors).toEqual({});
    });

    it('handleSubmit resets isSubmitting even when onSubmit throws', async () => {
        const onSubmit = jest.fn().mockRejectedValue(new Error('fail'));
        const { result } = renderHook(() => useForm({ initialValues: {}, onSubmit }));

        await act(async () => {
            await expect(result.current.handleSubmit(makeEvent())).rejects.toThrow('fail');
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it('handleSubmit works without an event argument', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => useForm({ initialValues: {}, onSubmit }));

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(onSubmit).toHaveBeenCalled();
    });

    it('resetForm restores initial values and clears errors/isSubmitting', () => {
        const { result } = renderHook(() => useForm({ initialValues: { name: 'A' } }));
        act(() => {
            result.current.handleChange(makeEvent({ name: 'name', value: 'Changed', type: 'text' }));
        });
        expect(result.current.values.name).toBe('Changed');

        act(() => {
            result.current.resetForm();
        });
        expect(result.current.values).toEqual({ name: 'A' });
        expect(result.current.errors).toEqual({});
        expect(result.current.isSubmitting).toBe(false);
    });

    it('setValues allows direct value assignment', () => {
        const { result } = renderHook(() => useForm({ initialValues: {} }));
        act(() => {
            result.current.setValues({ custom: 'value' });
        });
        expect(result.current.values).toEqual({ custom: 'value' });
    });
});
