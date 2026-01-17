
import React, { useState, useEffect, useRef } from 'react';

interface EditableProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  type?: 'text' | 'number' | 'textarea';
  multiline?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Editable: React.FC<EditableProps> = ({ 
  value, 
  onChange, 
  className = '', 
  type = 'text',
  multiline = false,
  onClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setInternalValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (String(value) !== internalValue) {
      onChange(internalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as any}
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onBlur={handleBlur}
          className={`w-full p-1 border border-blue-400 rounded focus:outline-none bg-white ${className}`}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef as any}
        type={type}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-1 border border-blue-400 rounded focus:outline-none bg-white ${className}`}
      />
    );
  }

  // Check for truly empty values (undefined, null, or empty string)
  // Ensure 0 is rendered correctly
  const displayValue = (value !== undefined && value !== null && value !== '') ? value : null;

  return (
    <div 
      onClick={(e) => {
        setIsEditing(true);
        if (onClick) onClick(e);
      }}
      className={`cursor-text hover:bg-slate-50 transition-colors rounded p-1 -m-1 group relative ${className}`}
    >
      {displayValue !== null ? displayValue : <span className="text-gray-300 italic">Empty</span>}
      <i className="fa-solid fa-pen absolute -right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 no-print"></i>
    </div>
  );
};
