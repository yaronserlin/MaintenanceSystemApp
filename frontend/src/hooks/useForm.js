/**
 * Custom React hook for managing form state, validation, and submission.
 * @param {{ initialValues: object, validate?: (values: object) => object, onSubmit?: (values: object) => void }} options
 * @returns {{ values: object, errors: object, isSubmitting: boolean, handleChange: function, handleSubmit: function, resetForm: function, setValues: function }}
 */
import { useState } from 'react';

function useForm({ initialValues = {}, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change events for form elements.
   * Supports checkbox and file inputs.
   */
  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    const inputValue =
      type === 'checkbox' ? checked : type === 'file' ? files : value;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: inputValue,
    }));
  };

  /**
   * Handle form submission synchronously without stale-effect dependencies.
   */
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    let validationErrors = {};
    if (typeof validate === 'function') {
      validationErrors = validate(values) || {};
      setErrors(validationErrors);
    } else {
      setErrors({});
    }

    const noErrors = Object.keys(validationErrors).length === 0;
    if (noErrors && typeof onSubmit === 'function') {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Reset the form to its initial state.
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
  };
}

export default useForm;
