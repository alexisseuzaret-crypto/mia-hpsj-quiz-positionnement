'use client';

import { useRef } from 'react';
import type { Question } from '@/lib/questions';

type Props = {
  question: Question;
  selectedValues: string[];
  onAnswer: (values: string[]) => void;
  otherText?: string;
  onOtherText?: (text: string) => void;
};

export default function QuizQuestion({ question, selectedValues, onAnswer, otherText, onOtherText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSingle = (value: string) => {
    onAnswer([value]);
  };

  const handleMultiple = (value: string) => {
    const { exclusiveValue } = question;

    if (exclusiveValue && value === exclusiveValue) {
      onAnswer([value]);
      return;
    }

    if (exclusiveValue && selectedValues.includes(exclusiveValue)) {
      onAnswer([value]);
      return;
    }

    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onAnswer(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
          {question.label}
        </p>
        {question.helpText && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {question.helpText}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <div key={opt.value}>
              <button
                type="button"
                onClick={() =>
                  question.type === 'single'
                    ? handleSingle(opt.value)
                    : handleMultiple(opt.value)
                }
                className="w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer"
                style={{
                  borderColor: isSelected ? 'var(--primary)' : '#E2E8F0',
                  background: isSelected ? 'var(--primary)' : 'var(--background)',
                  color: isSelected ? '#fff' : 'var(--text)',
                }}
                aria-pressed={isSelected}
              >
                {opt.label}
              </button>

              {opt.allowOtherText && isSelected && (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Préciser…"
                  value={otherText ?? ''}
                  onChange={(e) => onOtherText?.(e.target.value)}
                  maxLength={200}
                  className="mt-2 w-full px-3 py-2 text-sm rounded-lg border outline-none"
                  style={{
                    borderColor: 'var(--primary)',
                    color: 'var(--text)',
                    background: 'var(--background)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
