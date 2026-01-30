import React from 'react';
import { View, Text } from 'react-native';

interface MarkdownTextProps {
  content: string;
  baseStyle?: object;
}

/**
 * Simple Markdown renderer for journal entries
 * Supports: **bold**, *italic*, - lists, # headers, > quotes
 */
export function MarkdownText({ content, baseStyle }: MarkdownTextProps) {
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, lineIndex) => {
        // Check for headers
        if (line.startsWith('### ')) {
          return (
            <Text
              key={lineIndex}
              style={[
                { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#44403C', marginTop: 12, marginBottom: 4 },
                baseStyle,
              ]}
            >
              {renderInlineFormatting(line.substring(4))}
            </Text>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Text
              key={lineIndex}
              style={[
                { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: '#44403C', marginTop: 14, marginBottom: 4 },
                baseStyle,
              ]}
            >
              {renderInlineFormatting(line.substring(3))}
            </Text>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <Text
              key={lineIndex}
              style={[
                { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: '#44403C', marginTop: 16, marginBottom: 6 },
                baseStyle,
              ]}
            >
              {renderInlineFormatting(line.substring(2))}
            </Text>
          );
        }

        // Check for blockquotes
        if (line.startsWith('> ')) {
          return (
            <View
              key={lineIndex}
              style={{
                borderLeftWidth: 3,
                borderLeftColor: '#C4775A',
                paddingLeft: 12,
                marginVertical: 8,
                backgroundColor: '#FAF8F5',
                paddingVertical: 8,
                borderRadius: 4,
              }}
            >
              <Text
                style={[
                  { fontFamily: 'CormorantGaramond_500Medium', fontSize: 16, color: '#78716C', fontStyle: 'italic', lineHeight: 24 },
                  baseStyle,
                ]}
              >
                {renderInlineFormatting(line.substring(2))}
              </Text>
            </View>
          );
        }

        // Check for unordered lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <View key={lineIndex} style={{ flexDirection: 'row', marginVertical: 2, paddingLeft: 4 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#C4775A', marginRight: 8 }}>•</Text>
              <Text
                style={[
                  { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#44403C', lineHeight: 26, flex: 1 },
                  baseStyle,
                ]}
              >
                {renderInlineFormatting(line.substring(2))}
              </Text>
            </View>
          );
        }

        // Check for numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s/);
        if (numberedMatch) {
          return (
            <View key={lineIndex} style={{ flexDirection: 'row', marginVertical: 2, paddingLeft: 4 }}>
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#78716C', marginRight: 8, minWidth: 20 }}>
                {numberedMatch[1]}.
              </Text>
              <Text
                style={[
                  { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#44403C', lineHeight: 26, flex: 1 },
                  baseStyle,
                ]}
              >
                {renderInlineFormatting(line.substring(numberedMatch[0].length))}
              </Text>
            </View>
          );
        }

        // Empty line
        if (line.trim() === '') {
          return <View key={lineIndex} style={{ height: 12 }} />;
        }

        // Regular paragraph
        return (
          <Text
            key={lineIndex}
            style={[
              { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#44403C', lineHeight: 26 },
              baseStyle,
            ]}
          >
            {renderInlineFormatting(line)}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * Render inline formatting (bold, italic)
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold (**text**)
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Check for italic (*text*)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    // Find the earliest match
    type MatchType = { type: 'bold' | 'italic'; match: RegExpMatchArray };
    let earliestMatch: MatchType | null = null;

    if (boldMatch) {
      earliestMatch = { type: 'bold', match: boldMatch };
    }
    if (italicMatch) {
      if (!earliestMatch || (italicMatch.index ?? 0) < (earliestMatch.match.index ?? 0)) {
        earliestMatch = { type: 'italic', match: italicMatch };
      }
    }

    if (earliestMatch) {
      const { type, match } = earliestMatch;
      const matchIndex = match.index ?? 0;

      // Add text before the match
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }

      // Add formatted text
      if (type === 'bold') {
        parts.push(
          <Text key={key++} style={{ fontFamily: 'DMSans_600SemiBold' }}>
            {match[1]}
          </Text>
        );
      } else {
        parts.push(
          <Text key={key++} style={{ fontStyle: 'italic' }}>
            {match[1]}
          </Text>
        );
      }

      remaining = remaining.substring(matchIndex + match[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Format helpers for the toolbar
 */
export function insertFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  format: 'bold' | 'italic' | 'header' | 'quote' | 'list' | 'numbered'
): { newText: string; newCursorPosition: number } {
  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeSelection = text.substring(0, selectionStart);
  const afterSelection = text.substring(selectionEnd);

  let replacement: string;
  let cursorOffset: number;

  switch (format) {
    case 'bold':
      if (selectedText) {
        replacement = `**${selectedText}**`;
        cursorOffset = replacement.length;
      } else {
        replacement = '**bold text**';
        cursorOffset = 2; // Position cursor after opening **
      }
      break;

    case 'italic':
      if (selectedText) {
        replacement = `*${selectedText}*`;
        cursorOffset = replacement.length;
      } else {
        replacement = '*italic text*';
        cursorOffset = 1;
      }
      break;

    case 'header':
      // Add ## at the start of the line
      const lineStart = beforeSelection.lastIndexOf('\n') + 1;
      const prefix = beforeSelection.substring(0, lineStart);
      const lineContent = beforeSelection.substring(lineStart) + selectedText + afterSelection.split('\n')[0];
      const restAfter = afterSelection.substring(afterSelection.indexOf('\n'));

      return {
        newText: prefix + '## ' + lineContent + restAfter,
        newCursorPosition: selectionStart + 3,
      };

    case 'quote':
      const quoteLineStart = beforeSelection.lastIndexOf('\n') + 1;
      const quotePrefix = beforeSelection.substring(0, quoteLineStart);
      const quoteLine = beforeSelection.substring(quoteLineStart) + selectedText;

      return {
        newText: quotePrefix + '> ' + quoteLine + afterSelection,
        newCursorPosition: selectionStart + 2,
      };

    case 'list':
      replacement = selectedText ? `\n- ${selectedText}` : '\n- ';
      cursorOffset = replacement.length;
      break;

    case 'numbered':
      replacement = selectedText ? `\n1. ${selectedText}` : '\n1. ';
      cursorOffset = replacement.length;
      break;

    default:
      return { newText: text, newCursorPosition: selectionEnd };
  }

  return {
    newText: beforeSelection + replacement + afterSelection,
    newCursorPosition: selectionStart + cursorOffset,
  };
}
