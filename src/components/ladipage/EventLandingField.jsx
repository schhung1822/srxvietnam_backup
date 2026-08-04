'use client';

import { ChevronDown } from 'lucide-react';
import { joinClassNames, normalizeText } from '../../lib/ladipage/eventLandingForm.js';

const SELECT_TYPES = new Set(['select', 'dropdown', 'radio']);

export default function EventLandingField({
  field,
  value,
  onChange,
  labelClassName = '',
  requiredMarkClassName = '',
  controlClassName = '',
  chevronClassName = '',
}) {
  const isSelect = SELECT_TYPES.has(field.type);
  const sharedProps = {
    id: field.key,
    name: field.key,
    value,
    onChange,
    required: field.required,
  };

  return (
    <div>
      <label htmlFor={field.key} className={labelClassName}>
        {field.label}
        {field.required ? <span className={joinClassNames('ml-1', requiredMarkClassName)}>*</span> : null}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          {...sharedProps}
          placeholder={field.placeholder}
          rows={4}
          className={joinClassNames(controlClassName, 'min-h-[7rem] resize-y')}
        />
      ) : isSelect ? (
        <div className="relative">
          <select {...sharedProps} className={joinClassNames(controlClassName, 'appearance-none pr-11')}>
            <option value="">Chọn {normalizeText(field.label).toLowerCase()}</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className={joinClassNames(
              'pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2',
              chevronClassName,
            )}
          />
        </div>
      ) : (
        <input
          {...sharedProps}
          type={field.type}
          placeholder={field.placeholder}
          inputMode={field.key === 'phone' ? 'tel' : undefined}
          className={controlClassName}
        />
      )}
    </div>
  );
}
