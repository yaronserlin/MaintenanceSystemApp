/**
 * Custom React hook for managing form state, validation, and submission.
 * @param {{ initialValues: object, validate?: (values: object) => object, onSubmit?: (values: object) => void }} options
 * @returns {{ values: object, errors: object, isSubmitting: boolean, handleChange: function, handleSubmit: function, resetForm: function }}
 */
import { useState, useEffect } from 'react';

function useForm({ initialValues = {}, validate, onSubmit }) {
  // State to hold form values
  const [values, setValues] = useState(initialValues);
  // State to hold validation errors
  const [errors, setErrors] = useState({});
  // State to track submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to handle submission callback after validation
  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.keys(errors).length === 0;
      if (noErrors && typeof onSubmit === 'function') {
        onSubmit(values);
      }
      // Reset submitting flag
      setIsSubmitting(false);
    }
  }, [errors]);

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
   * Handle form submission.
   * Prevents default browser behavior, triggers validation, and sets submitting flag.
   */
  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    if (typeof validate === 'function') {
      const validationErrors = validate(values);
      console.log('Validation Errors:', validationErrors);

      setErrors(validationErrors);
    } else {
      setErrors({});
    }
    setIsSubmitting(true);
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
    setValues, // Exposed in case you need to programmatically update values
  };
}

export default useForm;

/* ==================== Usage Example ====================
import React from 'react';
import useForm from '../hooks/useForm';

function MyForm() {
  const initialValues = { name: '', email: '' };

  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    return errors;
  };

  const onSubmit = (values) => {
    console.log('Submitted values:', values);
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  } = useForm({ initialValues, validate, onSubmit });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={values.name}
          onChange={handleChange}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={values.email}
          onChange={handleChange}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
      <button type="button" onClick={resetForm}>
        Reset
      </button>
    </form>
  );
}
*/
