/**
 * Form Accessibility Utilities & Testing Guide
 * Ensures all forms meet WCAG 2.1 Level AA standards
 */

/**
 * Required form accessibility patterns
 */

interface FormFieldAccessibilityProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "select" | "textarea" | "checkbox" | "radio";
}

/**
 * Build accessible form field with proper associations
 */
export function buildAccessibleFormField({
  id,
  label,
  required = false,
  error,
  hint,
  type = "text",
}: FormFieldAccessibilityProps) {
  const fieldId = id;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  // ARIA attributes for the input
  const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(" ");

  return {
    fieldId,
    labelProps: {
      htmlFor: fieldId,
      className: "block text-sm font-medium text-foreground",
      children: required ? `${label} *` : label,
    },
    inputProps: {
      id: fieldId,
      "aria-label": label,
      "aria-required": required,
      "aria-invalid": !!error,
      "aria-describedby": ariaDescribedBy || undefined,
      required,
      type,
      className: error 
        ? "border border-loss focus:ring-loss" 
        : "border border-border focus:ring-field",
    },
    errorProps: errorId ? {
      id: errorId,
      role: "alert",
      className: "text-sm font-medium text-loss mt-1",
      children: error,
    } : null,
    hintProps: hintId ? {
      id: hintId,
      className: "text-xs text-muted-foreground mt-1",
      children: hint,
    } : null,
  };
}

/**
 * Form accessibility checklist
 */
export const formAccessibilityChecklist = {
  labels: {
    title: "Form Labels",
    items: [
      {
        requirement: "Every input has an associated label",
        test: "Check <label htmlFor='inputId'> connects to input id",
        passed: false,
      },
      {
        requirement: "Labels are visible (not hidden)",
        test: "Labels should be visible to all users, not sr-only",
        passed: false,
      },
      {
        requirement: "Required fields are marked",
        test: "Use * or aria-required='true'",
        passed: false,
      },
    ],
  },

  errors: {
    title: "Error Messages",
    items: [
      {
        requirement: "Error messages are associated with fields",
        test: "Use aria-describedby pointing to error message id",
        passed: false,
      },
      {
        requirement: "Error messages are announced",
        test: "Use role='alert' on error container",
        passed: false,
      },
      {
        requirement: "Invalid state is indicated",
        test: "Use aria-invalid='true' on input",
        passed: false,
      },
      {
        requirement: "Errors are visible in focus",
        test: "Focus moving to field shows error clearly",
        passed: false,
      },
    ],
  },

  fieldTypes: {
    title: "Input Types",
    items: [
      {
        requirement: "Text inputs have correct type",
        test: "type='email' for email, type='tel' for phone, etc.",
        passed: false,
      },
      {
        requirement: "Checkboxes are properly marked",
        test: "role='checkbox' with aria-checked attribute",
        passed: false,
      },
      {
        requirement: "Radio groups have proper structure",
        test: "fieldset with legend, role='group'",
        passed: false,
      },
      {
        requirement: "Select inputs have labels",
        test: "<label><select> structure with proper association",
        passed: false,
      },
    ],
  },

  hints: {
    title: "Helper Text",
    items: [
      {
        requirement: "Helper text is associated",
        test: "Use aria-describedby for hints and instructions",
        passed: false,
      },
      {
        requirement: "Character limits are announced",
        test: "aria-label with current/max count",
        passed: false,
      },
      {
        requirement: "Format requirements are clear",
        test: "Visible hint text like 'Format: MM/DD/YYYY'",
        passed: false,
      },
    ],
  },

  keyboard: {
    title: "Keyboard Navigation",
    items: [
      {
        requirement: "All form fields are focusable",
        test: "Tab through form - all inputs should be reachable",
        passed: false,
      },
      {
        requirement: "Focus order is logical",
        test: "Tab moves through form in reading order",
        passed: false,
      },
      {
        requirement: "Focus is visible",
        test: "Focus ring visible on all focused elements",
        passed: false,
      },
      {
        requirement: "Form can be submitted with keyboard",
        test: "Tab to submit button, press Enter to submit",
        passed: false,
      },
      {
        requirement: "Tab trap is avoided",
        test: "Focus can exit submit button without getting stuck",
        passed: false,
      },
    ],
  },

  screenReader: {
    title: "Screen Reader Testing",
    items: [
      {
        requirement: "Form purpose is announced",
        test: "Page heading and form legend are announced",
        passed: false,
      },
      {
        requirement: "Labels are announced",
        test: "Screen reader announces label when field focused",
        passed: false,
      },
      {
        requirement: "Errors are announced",
        test: "Screen reader announces error message",
        passed: false,
      },
      {
        requirement: "Field type is announced",
        test: "Screen reader announces 'text input', 'checkbox', etc.",
        passed: false,
      },
      {
        requirement: "Required state is announced",
        test: "Screen reader announces 'required' on required fields",
        passed: false,
      },
      {
        requirement: "Validation feedback is announced",
        test: "Success/error messages announced on submit",
        passed: false,
      },
    ],
  },

  validation: {
    title: "Validation & Feedback",
    items: [
      {
        requirement: "Validation happens on submit",
        test: "Don't validate on blur for better UX",
        passed: false,
      },
      {
        requirement: "Errors are clear and actionable",
        test: "Show what's wrong and how to fix it",
        passed: false,
      },
      {
        requirement: "Success feedback is clear",
        test: "Show success message or redirect",
        passed: false,
      },
      {
        requirement: "Form can be re-submitted",
        test: "Can fix errors and submit again",
        passed: false,
      },
    ],
  },

  mobile: {
    title: "Mobile Accessibility",
    items: [
      {
        requirement: "Touch targets are 44x44px minimum",
        test: "Measure button/input size in DevTools",
        passed: false,
      },
      {
        requirement: "Labels are tap-friendly",
        test: "Can tap label to focus input",
        passed: false,
      },
      {
        requirement: "No hover-only affordances",
        test: "All interactions work on touch",
        passed: false,
      },
      {
        requirement: "Mobile keyboard doesn't hide inputs",
        test: "Inputs remain visible when keyboard opens",
        passed: false,
      },
    ],
  },
};

/**
 * Form accessibility test cases
 */
export const formAccessibilityTests = [
  {
    name: "Basic text input with label",
    html: `
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
    `,
    issues: [],
    fixed: true,
  },
  {
    name: "Input with error message",
    html: `
      <label htmlFor="email">Email</label>
      <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
      <span id="email-error" role="alert">Invalid email format</span>
    `,
    issues: [],
    fixed: true,
  },
  {
    name: "Input with helper text",
    html: `
      <label htmlFor="password">Password</label>
      <input id="password" type="password" aria-describedby="password-hint" />
      <span id="password-hint">Minimum 8 characters</span>
    `,
    issues: [],
    fixed: true,
  },
  {
    name: "Checkbox field",
    html: `
      <input id="terms" type="checkbox" />
      <label htmlFor="terms">I agree to the terms</label>
    `,
    issues: ["Label should describe the checkbox action"],
    fixed: false,
  },
  {
    name: "Radio group",
    html: `
      <fieldset>
        <legend>Choose an option</legend>
        <div>
          <input id="option1" type="radio" name="options" />
          <label htmlFor="option1">Option 1</label>
        </div>
        <div>
          <input id="option2" type="radio" name="options" />
          <label htmlFor="option2">Option 2</label>
        </div>
      </fieldset>
    `,
    issues: [],
    fixed: true,
  },
  {
    name: "Select field",
    html: `
      <label htmlFor="country">Country</label>
      <select id="country">
        <option>Select a country</option>
        <option>Indonesia</option>
      </select>
    `,
    issues: [],
    fixed: true,
  },
  {
    name: "Textarea",
    html: `
      <label htmlFor="message">Message</label>
      <textarea id="message"></textarea>
    `,
    issues: [],
    fixed: true,
  },
];

/**
 * Keyboard testing commands
 */
export const keyboardTestingGuide = {
  tabKey: {
    description: "Tab through form",
    expectedBehavior: "Move to next focusable element",
    acceptanceCriteria: [
      "All form fields are reached",
      "Order is logical (top to bottom, left to right)",
      "Focus indicator is visible",
    ],
  },
  shiftTab: {
    description: "Shift+Tab - reverse Tab",
    expectedBehavior: "Move to previous focusable element",
    acceptanceCriteria: [
      "Move backwards through fields",
      "Focus indicator remains visible",
    ],
  },
  enter: {
    description: "Enter on focused button",
    expectedBehavior: "Activate button",
    acceptanceCriteria: [
      "Form submits on Enter",
      "Button action executes",
    ],
  },
  space: {
    description: "Space on checkbox/radio",
    expectedBehavior: "Toggle selection",
    acceptanceCriteria: [
      "Checkbox toggles checked",
      "Radio selects option",
    ],
  },
  escape: {
    description: "Escape from modal form",
    expectedBehavior: "Close modal",
    acceptanceCriteria: [
      "Modal closes",
      "Focus returns to opener",
    ],
  },
};

/**
 * Example: Accessible form component pattern
 */
export const accessibleFormExample = `
// React component example
import { FormFieldError } from '@/components/error-state';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [data, setData] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.email.includes('@')) newErrors.email = 'Invalid email';
    if (!data.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Submit form
      console.log('Submitting:', data);
      // Announce success
      announceToScreenReader('Form submitted successfully');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend className="sr-only">Contact form</legend>
        
        {/* Name Field */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name <span aria-label="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className="mt-1 block w-full border border-border rounded px-3 py-2"
            required
          />
          {errors.name && (
            <FormFieldError id="name-error" message={errors.name} />
          )}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : 'email-hint'}
            className="mt-1 block w-full border border-border rounded px-3 py-2"
            required
          />
          {errors.email ? (
            <FormFieldError id="email-error" message={errors.email} />
          ) : (
            <p id="email-hint" className="text-xs text-muted-foreground mt-1">
              We'll never share your email
            </p>
          )}
        </div>

        {/* Message Field */}
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium">
            Message <span aria-label="required">*</span>
          </label>
          <textarea
            id="message"
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className="mt-1 block w-full border border-border rounded px-3 py-2"
            rows={5}
            required
          />
          {errors.message && (
            <FormFieldError id="message-error" message={errors.message} />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-field text-field-foreground px-4 py-2 rounded font-medium hover:opacity-90"
          aria-label="Submit contact form"
        >
          Send Message
        </button>
      </fieldset>
    </form>
  );
}
`;
