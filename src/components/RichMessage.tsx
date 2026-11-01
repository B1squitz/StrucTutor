import React, { useMemo } from 'react';
import katex from 'katex';
import { parseRichText } from '../utils/parseRichText';
import { cleanProseText } from '../utils/cleanProseText';

export interface RichMessageProps {
  text: string;
  className?: string;
}

export const RichMessage: React.FC<RichMessageProps> = ({
  text,
  className = '',
}) => {
  const segments = useMemo(() => parseRichText(text), [text]);

  return (
    <div className={`font-sans leading-relaxed ${className}`}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {cleanProseText(segment.value)}
            </span>
          );
        }

        const html = katex.renderToString(segment.value, {
          throwOnError: false,
          displayMode: segment.displayMode,
          strict: 'ignore',
        });

        if (segment.displayMode) {
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto py-1"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={index}
            className="inline-block px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};
